import { CommunityDesktopTabs } from '@/components/community/community-desktop-tabs'
import { CommunityService } from '@/services/community-service'
import type { DiscussionCategory, CommunityEvent } from '@/types'
import { CalendarDays, MapPin } from 'lucide-react'
import { EventCreateButton } from '@/components/community/event-create-fab'

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  academic: { bg: 'bg-blue-100', text: 'text-blue-700' },
  career: { bg: 'bg-green-100', text: 'text-green-700' },
  social: { bg: 'bg-purple-100', text: 'text-purple-700' },
  sports: { bg: 'bg-orange-100', text: 'text-orange-700' },
}

const EVENT_TYPE_CARD_CLASSES: Record<string, string> = {
  academic: 'bg-blue-50',
  career: 'bg-green-50',
  social: 'bg-purple-50',
  sports: 'bg-orange-50',
}

const EVENT_TYPE_CARD_HOVER_CLASSES: Record<string, string> = {
  academic: 'hover:border-blue-300 hover:bg-blue-100',
  career: 'hover:border-green-300 hover:bg-green-100',
  social: 'hover:border-purple-300 hover:bg-purple-100',
  sports: 'hover:border-orange-300 hover:bg-orange-100',
}

function eventTypePillClasses(type: string) {
  const colors = EVENT_TYPE_COLORS[type] || { bg: 'bg-neutral-100', text: 'text-neutral-700' }
  return `inline-flex items-center rounded-full border border-blue-300 px-2.5 py-0.5 text-xs font-bold uppercase tracking-tight ${colors.bg} ${colors.text}`
}

function eventTypeCardClasses(type: string) {
  return EVENT_TYPE_CARD_CLASSES[type] || 'bg-white'
}

function eventTypeCardHoverClasses(type: string) {
  return EVENT_TYPE_CARD_HOVER_CLASSES[type] || 'hover:border-blue-300 hover:bg-blue-50'
}

export default async function EventsPage() {
  const categories = await CommunityService.getCategories().catch(() => [] as DiscussionCategory[])
  const events = await CommunityService.getEvents({ limit: 20 }).catch(() => [] as CommunityEvent[])

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="lg:hidden bg-white border-b border-neutral-200 py-6">
        <div className="px-4 sm:px-6">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase">Events</h1>
          <p className="text-neutral-600 mt-1 text-sm">
            Stay tuned for upcoming campus events, workshops, and webinars.
          </p>
        </div>
      </div>

      {/* Mobile: event cards */}
      <div className="lg:hidden px-4 sm:px-6 py-4">
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
              <CalendarDays className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">No events yet</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className={`${eventTypeCardClasses(event.event_type)} ${eventTypeCardHoverClasses(event.event_type)} rounded-2xl border border-neutral-200 p-4 transition-colors`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className={eventTypePillClasses(event.event_type)}>
                      {event.event_type.replace(/[-_]/g, ' ')}
                    </span>
                    <h3 className="text-base font-black text-neutral-900 mt-1">{event.title}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{event.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs font-medium text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location || 'Campus'}
                      </span>
                      {event.max_attendees && (
                        <span>{event.max_attendees} spots</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <EventCreateButton />

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
