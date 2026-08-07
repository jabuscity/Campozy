import { createClient } from '@/lib/supabase/server'
import type { CommunityPost, PostComment } from '@/types'

export class FeedService {
  static async getPosts(currentUserId?: string | null): Promise<CommunityPost[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        author:profiles!community_posts_author_id_fkey(id, full_name, username, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Failed to fetch feed posts:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return []
    }

    const posts = data as CommunityPost[]

    if (!posts.length) return []

    const postIds = posts.map(p => p.id)

    const { data: votes } = await supabase
      .from('post_votes')
      .select('post_id, vote_type')
      .in('post_id', postIds)

    const { data: comments } = await supabase
      .from('post_comments')
      .select('post_id, id')
      .in('post_id', postIds)

    const { data: userVotes } = currentUserId
      ? await supabase
          .from('post_votes')
          .select('post_id, vote_type')
          .eq('user_id', currentUserId)
          .in('post_id', postIds)
      : { data: [] as { post_id: string; vote_type: number }[] }

    return posts.map(post => {
      const postVotes = (votes || []).filter(v => v.post_id === post.id) as { vote_type: number }[]
      const upvotes = postVotes.filter(v => v.vote_type === 1).length
      const downvotes = postVotes.filter(v => v.vote_type === -1).length

      return {
        ...post,
        vote_count: upvotes - downvotes,
        comment_count: (comments || []).filter(c => c.post_id === post.id).length,
        user_vote: currentUserId
          ? (userVotes || []).find(v => v.post_id === post.id)?.vote_type || null
          : null,
      }
    })
  }

  static async getPostById(postId: string, currentUserId?: string | null): Promise<CommunityPost | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        author:profiles!community_posts_author_id_fkey(id, full_name, username, avatar_url)
      `)
      .eq('id', postId)
      .single()

    if (error) {
      console.error('Failed to fetch post:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return null
    }

    const post = data as CommunityPost

    const { data: votes } = await supabase
      .from('post_votes')
      .select('vote_type')
      .eq('post_id', post.id)

    const upvotes = (votes || []).filter(v => v.vote_type === 1).length
    const downvotes = (votes || []).filter(v => v.vote_type === -1).length

    let userVote: number | null = null
    if (currentUserId) {
      const { data: uv } = await supabase
        .from('post_votes')
        .select('vote_type')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
        .single()
      userVote = uv?.vote_type || null
    }

    const { count: commentCount } = await supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)

    return {
      ...post,
      vote_count: upvotes - downvotes,
      comment_count: commentCount || 0,
      user_vote: userVote,
    }
  }

  static async getComments(postId: string): Promise<PostComment[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:profiles!inner(id, full_name, username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch comments:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return []
    }

    return data as PostComment[]
  }

  static async createPost(userId: string, title: string, content: string, imageUrl?: string | null) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('community_posts')
      .insert({
        author_id: userId,
        title,
        content,
        image_url: imageUrl || null,
      })

    if (error) {
      console.error('Failed to create post:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { error: 'Failed to create post.' }
    }

    return {}
  }

  static async addComment(postId: string, userId: string, content: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
      })

    if (error) {
      console.error('Failed to add comment:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { error: 'Failed to add comment.' }
    }

    return {}
  }

  static async vote(postId: string, userId: string, voteType: 1 | -1): Promise<{ error?: string }> {
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('post_votes')
      .select('vote_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Failed to check existing vote:', {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint,
      })
      return { error: 'Failed to process vote.' }
    }

    if (existing) {
      if (existing.vote_type === voteType) {
        const { error: delError } = await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (delError) {
          console.error('Failed to remove vote:', {
            message: delError.message,
            code: delError.code,
            details: delError.details,
            hint: delError.hint,
          })
          return { error: 'Failed to process vote.' }
        }
      } else {
        const { error: updError } = await supabase
          .from('post_votes')
          .update({ vote_type: voteType })
          .eq('post_id', postId)
          .eq('user_id', userId)

        if (updError) {
          console.error('Failed to update vote:', {
            message: updError.message,
            code: updError.code,
            details: updError.details,
            hint: updError.hint,
          })
          return { error: 'Failed to process vote.' }
        }
      }
    } else {
      const { error: insError } = await supabase
        .from('post_votes')
        .insert({ post_id: postId, user_id: userId, vote_type: voteType })

      if (insError) {
        console.error('Failed to insert vote:', {
          message: insError.message,
          code: insError.code,
          details: insError.details,
          hint: insError.hint,
        })
        return { error: 'Failed to process vote.' }
      }
    }

    return {}
  }

  static async deletePost(postId: string, userId: string): Promise<{ error?: string }> {
    const supabase = await createClient()

    const { data, error: fetchError } = await supabase
      .from('community_posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (fetchError) {
      return { error: 'Post not found.' }
    }

    if (data.author_id !== userId) {
      return { error: 'You can only delete your own posts.' }
    }

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', userId)

    if (error) {
      console.error('Failed to delete post:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { error: 'Failed to delete post.' }
    }

    return {}
  }
}
