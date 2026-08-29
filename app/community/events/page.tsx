import { CommunityDesktopTabs } from '@/components/community/community-desktop-tabs'
import { CommunityService } from '@/services/community-service'
import type { DiscussionCategory, CommunityEvent } from '@/types'

export default async function EventsPage() {
  const categories = await CommunityService.getCategories().catch(() => [] as DiscussionCategory[])
  const events = await CommunityService.getEvents({ limit: 20 }).catch(() => [] as CommunityEvent[])

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="lg:hidden bg-white border-b border-neutral-200 py-6">
        <div className="px-4 sm:px-6">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">Events</h1>
          <p className="text-neutral-600 mt-1 text-sm">
            Stay tuned for upcoming campus events, workshops, and webinars.
          </p>
        </div>
      </div>

      {/* Desktop: events-only view (no tab bar) */}
      <div className="hidden lg:block">
        <CommunityDesktopTabs
          discussions={[]}
          categories={categories}
          events={events}
          defaultTab="events"
          showDiscussionsTab={false}
          showEventsTab={false}
        />
      </div>
    </div>
  )
}
