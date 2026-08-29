import { createClient } from '@/lib/supabase/server'
import { CommunityService } from '@/services/community-service'
import type { Discussion, DiscussionCategory } from '@/types'
import { CommunityMobileTabs } from '@/components/community/community-mobile-tabs'
import { CommunityDesktopTabs } from '@/components/community/community-desktop-tabs'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const discussions = await CommunityService.getDiscussions({ limit: 20, userId: user?.id || undefined }).catch(() => [] as Discussion[])
  const categories = await CommunityService.getCategories().catch(() => [] as DiscussionCategory[])

  return (
    <div className="bg-neutral-50 min-h-screen">
      <CommunityMobileTabs discussions={discussions} userId={user?.id || null} />

      <div className="hidden lg:block">
        <CommunityDesktopTabs discussions={discussions} categories={categories} defaultTab="discussions" showEventsTab={false} showDiscussionsTab={false} />
      </div>
    </div>
  )
}
