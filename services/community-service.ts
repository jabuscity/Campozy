import { createClient } from '@/lib/supabase/server'
import type { Discussion, DiscussionReply } from '@/types'

// ============================================================================
// COMMUNITY SERVICE
// Core community intelligence: discussions, tips, warnings, knowledge articles.
// Implements the Knowledge Graph from doc 04 and Community layers.
// ============================================================================

export const CommunityService = {
  // ── Discussions ────────────────────────────────────────────────────────

  async getDiscussions(options?: { campusId?: string; neighborhoodId?: string; categoryId?: string; limit?: number; offset?: number }) {
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
    return (data || []) as Discussion[]
  },

  async getDiscussionById(discussionId: string) {
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

    return data as Discussion
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
  }
}
