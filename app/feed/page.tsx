import { IdentityService } from '@/services/identity-service'
import { FeedService } from '@/services/feed-service'
import { FeedView } from '@/components/feed/feed-view'
import type { CommunityPost, Profile } from '@/types'
import { createClient } from '@/lib/supabase/server'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentUser: Profile | null = null
  if (user) {
    currentUser = await IdentityService.getProfile(user.id)
  }

  const communityPosts = await FeedService.getPosts(currentUser?.id || null).catch(() => [] as CommunityPost[])

  const stats = {
    totalPosts: (communityPosts || []).filter(p => p.author_id === currentUser?.id).length,
    totalComments: (communityPosts || [])
      .filter(p => p.author_id === currentUser?.id)
      .reduce((sum, p) => sum + (p.comment_count || 0), 0),
    positiveVotes: (communityPosts || [])
      .filter(p => p.author_id === currentUser?.id)
      .reduce((sum, p) => sum + (p.upvotes || 0), 0),
    negativeVotes: (communityPosts || [])
      .filter(p => p.author_id === currentUser?.id)
      .reduce((sum, p) => sum + (p.downvotes || 0), 0),
  }

  const isPremium =
    !!currentUser?.user_badges?.some(
      b => b.badge?.name?.toLowerCase() === 'premium' || b.badge?.slug?.toLowerCase() === 'premium',
    ) || false

  return (
    <FeedView
      initialPosts={communityPosts || []}
      currentUser={currentUser}
      stats={stats}
      isPremium={isPremium}
    />
  )
}
