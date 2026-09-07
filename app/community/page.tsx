import { createClient } from '@/lib/supabase/server'
import type { Discussion, DiscussionCategory } from '@/types'
import { CommunityMobileTabs } from '@/components/community/community-mobile-tabs'
import { CommunityDesktopTabs } from '@/components/community/community-desktop-tabs'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let discussions: Discussion[] = []
  let categories: DiscussionCategory[] = []

  try {
    const [discussionsResult, categoriesResult] = await Promise.all([
      supabase
        .from('discussions')
        .select('*, author:profiles!discussions_user_id_fkey(username, full_name, avatar_url, trust_level), category:discussion_categories(name, id)')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('discussion_categories')
        .select('*')
        .order('name'),
    ])

    const baseDiscussions = (discussionsResult.data || []) as Discussion[]
    categories = (categoriesResult.data || []) as DiscussionCategory[]

    if (baseDiscussions.length > 0) {
      const discussionIds = baseDiscussions.map(d => d.id)

      const [votesResult, userVotesResult] = await Promise.all([
        supabase
          .from('discussion_votes')
          .select('discussion_id, vote_type')
          .in('discussion_id', discussionIds),
        user?.id
          ? supabase
              .from('discussion_votes')
              .select('discussion_id, vote_type')
              .in('discussion_id', discussionIds)
              .eq('user_id', user.id)
          : Promise.resolve({ data: [] as Array<{ discussion_id: string; vote_type: string }> }),
      ])

      const voteMap: Record<string, { upvotes: number; downvotes: number }> = {}
      for (const v of votesResult.data || []) {
        if (!voteMap[v.discussion_id]) {
          voteMap[v.discussion_id] = { upvotes: 0, downvotes: 0 }
        }
        if (v.vote_type === 'upvote') voteMap[v.discussion_id].upvotes++
        else if (v.vote_type === 'downvote') voteMap[v.discussion_id].downvotes++
      }

      const userVoteMap: Record<string, number> = {}
      for (const v of userVotesResult.data || []) {
        userVoteMap[v.discussion_id] = v.vote_type === 'upvote' ? 1 : -1
      }

      discussions = baseDiscussions.map(d => ({
        ...d,
        upvotes: voteMap[d.id]?.upvotes || 0,
        downvotes: voteMap[d.id]?.downvotes || 0,
        user_vote: userVoteMap[d.id] ?? null,
      }))
    }
  } catch (err) {
    console.error('Community page fetch error:', err)
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <CommunityMobileTabs discussions={discussions} userId={user?.id || null} />

      <div className="hidden lg:block">
        <CommunityDesktopTabs discussions={discussions} categories={categories} defaultTab="discussions" showEventsTab={false} showDiscussionsTab={false} userId={user?.id || null} />
      </div>
    </div>
  )
}
