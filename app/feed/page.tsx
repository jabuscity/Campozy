import { IdentityService } from '@/services/identity-service'
import { FeedService } from '@/services/feed-service'
import { FeedView } from '@/components/feed/feed-view'
import type { CommunityPost } from '@/types'

export default async function FeedPage() {
  const currentUser = await IdentityService.getCurrentUser()

  const communityPosts = await FeedService.getPosts(currentUser?.id || null).catch(() => [] as CommunityPost[])

  return (
    <FeedView
      initialPosts={communityPosts || []}
      currentUser={currentUser}
    />
  )
}
