import { createClient } from '@/lib/supabase/client'
import type { Profile, RoleName, ContactMethod, IdentityDocument, PropertyReview, Discussion, ForumPost, SavedProperty, SavedOpportunity, RoommateMatch, RoommateProfile, FriendMatch, FriendProfile, Property, Opportunity, CommunityPost } from '@/types'

// ============================================================================
// IDENTITY SERVICE
// Handles user profiles, roles, contact methods, and identity verification.
// ============================================================================

export const IdentityService = {
  // ── Profile ──────────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(*, roles(*)),
        user_badges(*, badges(*))
      `)
      .eq('id', userId)
      .single()

    if (error) return null
    return data as Profile
  },

  async getProfileByUsername(username: string): Promise<Profile | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(*, roles(*)),
        user_badges(*, badges(*))
      `)
      .eq('username', username)
      .single()

    if (error) return null
    return data as Profile
  },

  async updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'bio' | 'phone_number'>>
  ) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update profile: ${error.message}`)
    return data as Profile
  },

  async getCurrentUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    return this.getProfile(user.id)
  },

  // ── Roles ────────────────────────────────────────────────────────────────

  async assignRole(userId: string, roleName: RoleName) {
    const supabase = await createClient()

    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single()

    if (roleError) throw new Error(`Role "${roleName}" not found`)

    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role_id: role.id }, { onConflict: 'user_id,role_id' })

    if (error) throw new Error(`Failed to assign role: ${error.message}`)
  },

  async removeRole(userId: string, roleName: RoleName) {
    const supabase = await createClient()

    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single()

    if (!role) return

    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', role.id)
  },

  async getUserRoles(userId: string): Promise<RoleName[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)

    if (error || !data) return []
    return data.map((ur: { roles: { name: RoleName }[] }) => ur.roles[0]?.name).filter((name): name is RoleName => !!name)
  },

  async hasRole(userId: string, roleName: RoleName): Promise<boolean> {
    const roles = await this.getUserRoles(userId)
    return roles.includes(roleName)
  },

  // ── Contact Methods ──────────────────────────────────────────────────────

  async addContactMethod(userId: string, method: Pick<ContactMethod, 'method_type' | 'value' | 'is_primary'>) {
    const supabase = await createClient()

    // If setting as primary, unset existing primaries of same type
    if (method.is_primary) {
      await supabase
        .from('contact_methods')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('method_type', method.method_type)
    }

    const { data, error } = await supabase
      .from('contact_methods')
      .insert({ ...method, user_id: userId })
      .select()
      .single()

    if (error) throw new Error(`Failed to add contact method: ${error.message}`)
    return data
  },

  // ── Identity Documents ───────────────────────────────────────────────────

  async submitDocument(userId: string, doc: Pick<IdentityDocument, 'document_type' | 'document_url'>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('identity_documents')
      .insert({ ...doc, user_id: userId })
      .select()
      .single()

    if (error) throw new Error(`Failed to submit document: ${error.message}`)
    return data
  },

  async reviewDocument(documentId: string, reviewerId: string, status: 'approved' | 'rejected') {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('identity_documents')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single()

    if (error) throw new Error(`Failed to review document: ${error.message}`)

    // If approved, mark profile as verified
    if (status === 'approved') {
      const doc = data as IdentityDocument
      await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', doc.user_id)
    }

    return data
  },

  async getUserContributions(userId: string) {
    const supabase = await createClient()

    const [reviewsResult, discussionsResult, forumPostsResult, feedPostsResult] = await Promise.all([
      supabase
        .from('property_reviews')
        .select(`
          *,
          property:properties(id, name, neighborhood:neighborhoods(name))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('discussions')
        .select(`
          *,
          campus:campuses(name),
          neighborhood:neighborhoods(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('forum_posts')
        .select(`
          *,
          topic:forum_topics(title, forum:forums(name))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('community_posts')
        .select(`
          *,
          author:profiles!community_posts_author_id_fkey(id, full_name, username, avatar_url)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    const feedPosts = (feedPostsResult.data || []) as CommunityPost[]
    const feedPostIds = feedPosts.map(p => p.id)

    const [feedVotesResult, feedCommentsResult] = await Promise.all([
      supabase.from('post_votes').select('post_id, vote_type').in('post_id', feedPostIds),
      supabase.from('post_comments').select('post_id, id').in('post_id', feedPostIds),
    ])

    const feedPostsWithStats = feedPosts.map(post => {
      const postVotes = (feedVotesResult.data || []).filter(v => v.post_id === post.id) as { vote_type: number }[]
      const upvotes = postVotes.filter(v => v.vote_type === 1).length
      const downvotes = postVotes.filter(v => v.vote_type === -1).length
      return {
        ...post,
        upvotes,
        downvotes,
        vote_count: upvotes - downvotes,
        comment_count: (feedCommentsResult.data || []).filter(c => c.post_id === post.id).length,
      }
    })

    return {
      reviews: (reviewsResult.data || []) as Array<PropertyReview & { property?: { id: string; name: string; neighborhood?: { name: string } } }>,
      discussions: (discussionsResult.data || []) as Array<Discussion & { campus?: { name: string }; neighborhood?: { name: string } }>,
      forumPosts: (forumPostsResult.data || []) as Array<ForumPost & { topic?: { title: string; forum?: { name: string } } }>,
      feedPosts: feedPostsWithStats,
    }
  },

  async getUserSavedItems(userId: string) {
    const supabase = await createClient()

    const [savedPropertiesResult, savedOpportunitiesResult] = await Promise.all([
      supabase
        .from('saved_properties')
        .select(`
          *,
          property:properties(
            *,
            neighborhood:neighborhoods(name),
            property_type:property_types(name)
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })
        .limit(20),
      supabase
        .from('saved_opportunities')
        .select(`
          *,
          opportunity:opportunities(
            *,
            employer:employers(name)
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })
        .limit(20),
    ])

    return {
      properties: (savedPropertiesResult.data || []) as Array<SavedProperty & { property?: Property & { neighborhood?: { name: string }; property_type?: { name: string } } }>,
      opportunities: (savedOpportunitiesResult.data || []) as Array<SavedOpportunity & { opportunity?: Opportunity & { employer?: { name: string } } }>,
    }
  },

  async getUserMatches(userId: string) {
    const supabase = await createClient()

    const [roommateMatchesResult, friendMatchesResult] = await Promise.all([
      supabase
        .from('roommate_matches')
        .select(`
          *,
          profile:roommate_profiles(*)
        `)
        .eq('student_id', userId)
        .order('compatibility_score', { ascending: false })
        .limit(20),
      supabase
        .from('friend_matches')
        .select(`
          *,
          profile:friend_profiles(*)
        `)
        .eq('student_id', userId)
        .order('compatibility_score', { ascending: false })
        .limit(20),
    ])

    return {
      roommates: (roommateMatchesResult.data || []) as Array<RoommateMatch & { profile?: RoommateProfile }>,
      friends: (friendMatchesResult.data || []) as Array<FriendMatch & { profile?: FriendProfile }>,
    }
  },
}
