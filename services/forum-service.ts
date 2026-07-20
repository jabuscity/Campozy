import { createClient } from '@/lib/supabase/server'
import type { Forum, ForumTopic, ForumPost } from '@/types'

export const ForumService = {
  async getForums(options?: { campusId?: string; neighborhoodId?: string; limit?: number }) {
    const supabase = await createClient()
    let query = supabase
      .from('forums')
      .select(`
        *,
        created_by_profile:profiles!forums_created_by_fkey(id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (options?.campusId) query = query.eq('campus_id', options.campusId)
    if (options?.neighborhoodId) query = query.eq('neighborhood_id', options.neighborhoodId)
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch forums: ${error.message}`)
    return data as Forum[]
  },

  async getForumById(forumId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('forums')
      .select(`
        *,
        created_by_profile:profiles!forums_created_by_fkey(id, full_name, avatar_url)
      `)
      .eq('id', forumId)
      .single()

    if (error) throw new Error(`Forum not found: ${error.message}`)
    return data as Forum
  },

  async createForum(data: {
    name: string
    description?: string
    campus_id?: string
    neighborhood_id?: string
    is_public?: boolean
    created_by: string
  }) {
    const supabase = await createClient()
    const { data: forum, error } = await supabase
      .from('forums')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Failed to create forum: ${error.message}`)
    return forum as Forum
  },

  async getTopics(forumId: string, options?: { limit?: number; offset?: number }) {
    const supabase = await createClient()
    let query = supabase
      .from('forum_topics')
      .select(`
        *,
        author:profiles!forum_topics_user_id_fkey(id, full_name, avatar_url, trust_level)
      `)
      .eq('forum_id', forumId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (options?.limit) query = query.limit(options.limit)
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch topics: ${error.message}`)
    return data as ForumTopic[]
  },

  async getTopicById(topicId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        author:profiles!forum_topics_user_id_fkey(id, full_name, avatar_url, trust_level),
        forum:forums(id, name)
      `)
      .eq('id', topicId)
      .single()

    if (error) throw new Error(`Topic not found: ${error.message}`)
    return data as ForumTopic
  },

  async createTopic(data: {
    forum_id: string
    user_id: string
    title: string
    content: string
  }) {
    const supabase = await createClient()
    const { data: topic, error } = await supabase
      .from('forum_topics')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Failed to create topic: ${error.message}`)
    return topic as ForumTopic
  },

  async getPosts(topicId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles!forum_posts_user_id_fkey(id, full_name, avatar_url, trust_level)
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch posts: ${error.message}`)
    return data as ForumPost[]
  },

  async createPost(data: {
    topic_id: string
    user_id: string
    content: string
    parent_post_id?: string
  }) {
    const supabase = await createClient()
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Failed to create post: ${error.message}`)
    return post as ForumPost
  },

  async subscribe(userId: string, topicId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('forum_subscriptions')
      .upsert({ user_id: userId, topic_id: topicId, notify_on_reply: true })

    if (error) throw new Error(`Failed to subscribe: ${error.message}`)
  },

  async unsubscribe(userId: string, topicId: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('forum_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('topic_id', topicId)

    if (error) throw new Error(`Failed to unsubscribe: ${error.message}`)
  },
}
