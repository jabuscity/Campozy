import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileDashboard } from '@/components/profile/profile-dashboard'
import { TipService } from '@/services/tip-service'
import { OpportunitySuggestionService } from '@/services/opportunity-suggestion-service'
import { OpportunityService } from '@/services/opportunity-service'
import { IdentityService } from '@/services/identity-service'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles(*, roles(*)),
      students(*),
      alumni_profiles(*),
      founder_memberships(*, cohort:founder_cohorts(*))
    `)
    .eq('id', user.id)
    .single()

  const [
    tipPending,
    tipApproved,
    oppPending,
    oppApplications,
    communityPosts,
  ] = await Promise.all([
    TipService.getUserPendingSuggestions(user.id),
    TipService.getUserContributions(user.id),
    OpportunitySuggestionService.getUserPendingSuggestions(user.id),
    OpportunityService.getStudentApplications(user.id),
    IdentityService.getUserContributions(user.id),
  ])

  const forumParentIds = Array.from(
    new Set((communityPosts.forumPosts || []).map((p) => p.parent_post_id).filter(Boolean) as string[]),
  )
  const parentContent: Record<string, string> = {}
  if (forumParentIds.length > 0) {
    const { data: parentRows } = await supabase
      .from('forum_posts')
      .select('id, content')
      .in('id', forumParentIds)
    for (const row of parentRows || []) {
      parentContent[row.id] = row.content
    }
  }

  const firstSentence = (text?: string | null): string => {
    if (!text) return ''
    const match = text.match(/^.*?[.!?](\s|$)/)
    return (match ? match[0] : text).trim()
  }

  const forumPosts = (communityPosts.forumPosts || []).map((p) => ({
    ...p,
    replyTo:
      p.parent_post_id && parentContent[p.parent_post_id]
        ? firstSentence(parentContent[p.parent_post_id])
        : undefined,
  }))

  const posts = {
    tips: { pending: tipPending, approved: tipApproved },
    opportunities: { pending: oppPending, applications: oppApplications },
    community: {
      discussions: communityPosts.discussions,
      forumPosts,
      reviews: communityPosts.reviews,
      feedPosts: communityPosts.feedPosts,
    },
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <ProfileDashboard profile={profile} userId={user.id} posts={posts} />
      </div>
    </div>
  )
}
