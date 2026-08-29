import { createClient } from '@/lib/supabase/client'
import type { Discussion, DiscussionReply, DiscussionCategory } from '@/types'

export interface CommunityEvent {
  id: string
  title: string
  description: string
  event_type: string
  location: string | null
  start_time: string
  end_time: string | null
  campus_id: string | null
  organizer_id: string
  max_attendees: number | null
  is_public: boolean
  created_at: string
}

// ============================================================================
// COMMUNITY SERVICE
// Core community intelligence: discussions, tips, warnings, knowledge articles.
// Implements the Knowledge Graph from doc 04 and Community layers.
// ============================================================================

export const CommunityService = {
  // ── Categories ────────────────────────────────────────────────────────

  async getCategories(): Promise<DiscussionCategory[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('discussion_categories')
      .select('*')
      .order('name')

    if (error) return []
    return (data || []) as DiscussionCategory[]
  },

  async getEvents(options?: { limit?: number; eventType?: string }): Promise<CommunityEvent[]> {
    const supabase = await createClient()
    let query = supabase
      .from('events')
      .select('*')
      .eq('is_public', true)
      .order('start_time', { ascending: true })

    if (options?.eventType) query = query.eq('event_type', options.eventType)
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error) return []
    return (data || []) as CommunityEvent[]
  },

  // ── Discussions ────────────────────────────────────────────────────────

  async getDiscussions(options?: { campusId?: string; neighborhoodId?: string; categoryId?: string; limit?: number; offset?: number; userId?: string }): Promise<Discussion[]> {
    const supabase = await createClient()
    let query = supabase
      .from("discussions")
      .select(`
        *,
        author:profiles!discussions_user_id_fkey(username, full_name, avatar_url, trust_level),
        category:discussion_categories(name, id)
      `)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })

    if (options?.campusId) query = query.eq("campus_id", options.campusId)
    if (options?.neighborhoodId) query = query.eq("neighborhood_id", options.neighborhoodId)
    if (options?.categoryId) {
      const { data: categoryData } = await supabase
        .from("discussion_categories")
        .select("id")
        .eq("name", options.categoryId)
        .maybeSingle()

      if (categoryData?.id) {
        query = query.eq("category_id", categoryData.id)
      }
    }
    if (options?.limit) query = query.limit(options.limit)
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

    const { data, error } = await query
    if (error) return []
    let discussions = (data || []) as Discussion[]

    if (discussions.length > 0) {
      const discussionIds = discussions.map(d => d.id)

      const { data: votes } = await supabase
        .from('discussion_votes')
        .select('discussion_id, vote_type')
        .in('discussion_id', discussionIds)

      const voteMap: Record<string, { upvotes: number; downvotes: number }> = {}
      for (const v of votes || []) {
        if (!voteMap[v.discussion_id]) {
          voteMap[v.discussion_id] = { upvotes: 0, downvotes: 0 }
        }
        if (v.vote_type === 'upvote') {
          voteMap[v.discussion_id].upvotes++
        } else if (v.vote_type === 'downvote') {
          voteMap[v.discussion_id].downvotes++
        }
      }

      discussions = discussions.map(d => ({
        ...d,
        upvotes: voteMap[d.id]?.upvotes || 0,
        downvotes: voteMap[d.id]?.downvotes || 0,
      }))

      if (options?.userId) {
        const { data: userVotes } = await supabase
          .from('discussion_votes')
          .select('discussion_id, vote_type')
          .in('discussion_id', discussionIds)
          .eq('user_id', options.userId)

        const userVoteMap: Record<string, number> = {}
        for (const v of userVotes || []) {
          userVoteMap[v.discussion_id] = v.vote_type === 'upvote' ? 1 : -1
        }

        discussions = discussions.map(d => ({
          ...d,
          user_vote: userVoteMap[d.id] ?? null,
        }))
      }
    }

    return discussions
  },

  async getDiscussionById(discussionId: string, userId?: string): Promise<Discussion> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        author:profiles!discussions_user_id_fkey(username, full_name, avatar_url, trust_level),
        category:discussion_categories(name)
      `)
      .eq('id', discussionId)
      .single()

    if (error) throw new Error(`Discussion not found: ${error.message}`)

    let discussion = data as Discussion

    const { data: votes } = await supabase
      .from('discussion_votes')
      .select('discussion_id, vote_type')
      .eq('discussion_id', discussionId)

    let upvotes = 0
    let downvotes = 0
    for (const v of votes || []) {
      if (v.vote_type === 'upvote') upvotes++
      else if (v.vote_type === 'downvote') downvotes++
    }

    discussion = { ...discussion, upvotes, downvotes }

    if (userId) {
      const { data: userVote } = await supabase
        .from('discussion_votes')
        .select('vote_type')
        .eq('discussion_id', discussionId)
        .eq('user_id', userId)
        .maybeSingle()

      discussion = { ...discussion, user_vote: userVote ? (userVote.vote_type === 'upvote' ? 1 : -1) : null }
    }

    // Increment view count asynchronously
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('discussions')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ view_count: (supabase as any).raw('view_count + 1') })
        .eq('id', discussionId)
    } catch {
      // View count failure should not block loading the discussion
    }

    return discussion
  },

  async createDiscussion(data: {
    title: string;
    content: string;
    campus_id?: string;
    neighborhood_id?: string;
    category_id?: string;
    tags?: string[];
  }, userId: string) {
    const supabase = await createClient()
    const { data: discussion, error } = await supabase
      .from('discussions')
      .insert({ ...data, user_id: userId })
      .select()
      .single()

    if (error) throw new Error(`Failed to create discussion: ${error.message}`)

    // Log event
    await supabase.from('events').insert({
      actor_id: userId,
      event_type: 'discussion_created',
      target_id: discussion.id,
      target_type: 'discussion',
    })

    return discussion as Discussion
  },

  // ── Replies ────────────────────────────────────────────────────────────

  async getReplies(discussionId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('discussion_replies')
      .select(`
        *,
        author:profiles!discussion_replies_user_id_fkey(username, full_name, avatar_url, trust_level)
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch replies: ${error.message}`)
    return data as DiscussionReply[]
  },

  async addReply(discussionId: string, content: string, userId: string, parentReplyId?: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('discussion_replies')
      .insert({
        discussion_id: discussionId,
        content,
        user_id: userId,
        parent_reply_id: parentReplyId
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to add reply: ${error.message}`)
    return data as DiscussionReply
  },

  async getUserVote(discussionId: string, userId: string): Promise<number | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('discussion_votes')
      .select('vote_type')
      .eq('discussion_id', discussionId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) return null
    return data.vote_type === 'upvote' ? 1 : -1
  },

  async vote(discussionId: string, userId: string, voteType: 1 | -1): Promise<{ error?: string }> {
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('discussion_votes')
      .select('vote_type')
      .eq('discussion_id', discussionId)
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

    const newVoteType = voteType === 1 ? 'upvote' : 'downvote'

    if (existing) {
      if (existing.vote_type === newVoteType) {
        const { error: delError } = await supabase
          .from('discussion_votes')
          .delete()
          .eq('discussion_id', discussionId)
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
          .from('discussion_votes')
          .update({ vote_type: newVoteType })
          .eq('discussion_id', discussionId)
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
        .from('discussion_votes')
        .insert({ discussion_id: discussionId, user_id: userId, vote_type: newVoteType })

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
}
