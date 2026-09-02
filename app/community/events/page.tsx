import { CommunityDesktopTabs } from '@/components/community/community-desktop-tabs'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { DiscussionCategory, CommunityEvent } from '@/types'
import { CalendarDays, MapPin, Users } from 'lucide-react'
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

function formatEventDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function EventsPage() {
  const { data: categoriesData } = await supabaseAdmin
    .from('discussion_categories')
    .select('*')
    .order('name')

  const categories = (categoriesData || []) as DiscussionCategory[]

  const { data: eventsData } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('is_public', true)
    .order('start_time', { ascending: true })

  const events = (eventsData || []) as CommunityEvent[]

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Mobile: event cards */}
      <div className="lg:hidden px-4 sm:px-6 py-4 pb-24">
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
              <CalendarDays className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">No events yet</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className={`${eventTypeCardClasses(event.event_type)} ${eventTypeCardHoverClasses(event.event_type)} rounded-2xl border border-neutral-200 p-4 transition-colors`}>
                <span className={eventTypePillClasses(event.event_type)}>
                  {event.event_type.replace(/[-_]/g, ' ')}
                </span>
                <h3 className="text-base font-black text-neutral-900 mt-1">{event.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">{event.description}</p>
                <div className="space-y-2 pt-3 mt-3 border-t border-neutral-100">
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[11px] font-black text-neutral-900 uppercase tracking-wide block">Date</span>
                      <span className="text-xs text-neutral-700">{formatEventDate(event.start_time)}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[11px] font-black text-neutral-900 uppercase tracking-wide block">Location</span>
                      <span className="text-xs text-neutral-700">{event.location || 'Campus'}</span>
                    </div>
                  </div>
                  {event.max_attendees && (
                    <div className="flex items-start gap-2.5">
                      <Users className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-[11px] font-black text-neutral-900 uppercase tracking-wide block">Attendees</span>
                        <span className="text-xs text-neutral-700">{event.max_attendees} spots</span>
                      </div>
                    </div>
                  )}
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
