'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import CommunityRail from '@/components/community/community-rail'
import DiscussionList from '@/components/community/discussion-list'
import Link from 'next/link'
import {
  MessageCircle,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  Home,
  GraduationCap,
  Camera,
  Heart,
  Star,
  Briefcase,
  ShoppingCart,
  Cpu,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react'
import type { Discussion, DiscussionCategory, CommunityEvent } from '@/types'

type CommunityTab = 'discussions' | 'events'
type RailItem = {
  id: string
  title: string
  subtitle: string
  href?: string
}
type SearchResult = RailItem

interface CommunityDesktopTabsProps {
  discussions: Discussion[]
  categories: DiscussionCategory[]
  events?: CommunityEvent[]
  defaultTab?: CommunityTab
  showEventsTab?: boolean
  showDiscussionsTab?: boolean
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'General': <MessageSquare className="h-4 w-4" />,
  'Academics': <GraduationCap className="h-4 w-4" />,
  'Hostels': <Home className="h-4 w-4" />,
  'Campus Life': <Camera className="h-4 w-4" />,
  'Relationships': <Heart className="h-4 w-4" />,
  'Faith': <Star className="h-4 w-4" />,
  'Events': <CalendarDays className="h-4 w-4" />,
  'Marketplace': <ShoppingCart className="h-4 w-4" />,
  'Technology': <Cpu className="h-4 w-4" />,
  'Careers': <Briefcase className="h-4 w-4" />,
}

const EVENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  academic: <GraduationCap className="h-4 w-4" />,
  career: <Briefcase className="h-4 w-4" />,
  social: <Heart className="h-4 w-4" />,
  sports: <Star className="h-4 w-4" />,
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  academic: 'Academic',
  career: 'Career',
  social: 'Social',
  sports: 'Sports',
}

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

function eventTypeLabel(type: string) {
  return EVENT_TYPE_LABELS[type] || type.replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

function eventTypePillClasses(type: string) {
  const colors = EVENT_TYPE_COLORS[type] || { bg: 'bg-neutral-100', text: 'text-neutral-700' }
  return `inline-flex items-center gap-1.5 rounded-full border border-blue-300 px-3 py-1 text-xs font-bold uppercase tracking-tight ${colors.bg} ${colors.text}`
}

function eventTypeCardClasses(type: string) {
  return EVENT_TYPE_CARD_CLASSES[type] || 'bg-white'
}

function eventTypeCardHoverClasses(type: string) {
  return EVENT_TYPE_CARD_HOVER_CLASSES[type] || 'hover:border-blue-300 hover:bg-blue-50'
}

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function discussionScore(discussion: Discussion) {
  return (discussion.view_count || 0) + (discussion.reply_count || 0) * 6
}

export function CommunityDesktopTabs({ discussions, categories, events = [], defaultTab = 'discussions', showEventsTab = true, showDiscussionsTab = true }: CommunityDesktopTabsProps) {
  const [activeTab, setActiveTab] = React.useState<CommunityTab>(defaultTab)
  const [selectedFilter, setSelectedFilter] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false)
  const [showScrollButton, setShowScrollButton] = React.useState(false)
  const [isAtBottom, setIsAtBottom] = React.useState(false)
  const [trendingVisibleCount, setTrendingVisibleCount] = React.useState(5)
  const mainContentRef = React.useRef<HTMLDivElement | null>(null)
  const asideRef = React.useRef<HTMLDivElement | null>(null)
  const [asideNaturalTop, setAsideNaturalTop] = React.useState<number | null>(null)
  const searchRef = React.useRef<HTMLDivElement | null>(null)

  const sortedDiscussions = [...(discussions || [])].sort((a, b) => discussionScore(b) - discussionScore(a))
  const eventTypes = Array.from(new Set(events.map(event => event.event_type).filter(Boolean)))
  const sortedEvents = [...events].sort((a, b) => {
    const attendeeDelta = (b.max_attendees || 0) - (a.max_attendees || 0)
    if (attendeeDelta !== 0) return attendeeDelta
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  })

  const filteredDiscussions = selectedFilter
    ? (discussions || []).filter(d => d.category?.name === selectedFilter)
    : (discussions || [])

  const filteredEvents = selectedFilter
    ? events.filter(event => event.event_type === selectedFilter)
    : events

  const searchPlaceholder = activeTab === 'events'
    ? 'Search events...'
    : 'Search discussions...'

  function resetTabState() {
    setSelectedFilter(null)
    setSearchQuery('')
    setSearchResults([])
    setShowSearchDropdown(false)
    setTrendingVisibleCount(5)
  }

  React.useEffect(() => {
    if (!asideRef.current) return

    const asideRect = asideRef.current.getBoundingClientRect()

    if (asideRect.top < 150 && mainContentRef.current) {
      const mainRect = mainContentRef.current.getBoundingClientRect()
      setAsideNaturalTop(mainRect.top + window.scrollY)
    } else {
      setAsideNaturalTop(asideRect.top + window.scrollY)
    }
  }, [])

  // Unified, rAF-driven scroll handler to reduce jank and state thrash
  React.useEffect(() => {
    if (asideNaturalTop === null) return

    let ticking = false
    let lastY = window.scrollY

    const stages = [
      { threshold: 0, count: 5 },
      { threshold: 80, count: 4 },
      { threshold: 160, count: 3 },
      { threshold: 240, count: 2 },
      { threshold: 320, count: 1 },
      { threshold: 400, count: 0 },
      { threshold: 480, count: -1 },
    ]

    function onScroll() {
      lastY = window.scrollY
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    function update() {
      ticking = false
      if (asideNaturalTop === null) return
      const naturalTop = asideNaturalTop
      const stickStart = Math.max(0, naturalTop - 80)
      const scrollSinceStick = Math.max(0, lastY - stickStart)
      const collapseScroll = Math.max(0, scrollSinceStick - 40)

      let count = 5
      for (const stage of stages) {
        if (collapseScroll >= stage.threshold) count = stage.count
      }
      setTrendingVisibleCount(prev => (prev === count ? prev : count))

      if (asideRef.current) {
        const asideRect = asideRef.current.getBoundingClientRect()
        if (asideRect.top > 90) {
          const measuredNaturalTop = asideRect.top + lastY
          setAsideNaturalTop(prev => {
            if (prev === null || Math.abs(prev - measuredNaturalTop) > 10) {
              return measuredNaturalTop
            }
            return prev
          })
        }
      }

      const nearBottom = window.innerHeight + lastY >= document.documentElement.scrollHeight - 100
      const showButton = document.documentElement.scrollHeight > window.innerHeight + 100
      setIsAtBottom(prev => (prev === nearBottom ? prev : nearBottom))
      setShowScrollButton(prev => (prev === showButton ? prev : showButton))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [asideNaturalTop, activeTab])

  function scrollToTarget() {
    if (isAtBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    }
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim().length === 0) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    const lower = value.toLowerCase()
    const results = activeTab === 'events'
        ? events
          .filter(event =>
            event.title.toLowerCase().includes(lower) ||
            event.description.toLowerCase().includes(lower) ||
            (event.location || '').toLowerCase().includes(lower)
          )
          .map(event => ({
            id: event.id,
            title: event.title,
            subtitle: `${eventTypeLabel(event.event_type)} • ${event.location || 'Campus'}`,
            href: '/community/events',
          }))
        : (discussions || [])
          .filter(discussion =>
            discussion.title.toLowerCase().includes(lower) ||
            discussion.content.toLowerCase().includes(lower)
          )
          .map(discussion => ({
            id: discussion.id,
            title: discussion.title,
            subtitle: discussion.content,
            href: `/community?discussion=${discussion.id}`,
          }))

    setSearchResults(results)
    setShowSearchDropdown(results.length > 0)
  }

  function clearSearch() {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchDropdown(false)
  }

  function selectTab(tab: CommunityTab) {
    resetTabState()
    setActiveTab(tab)
  }

  function handleDiscussionsTabClick() {
    resetTabState()
    setActiveTab('discussions')
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {(showDiscussionsTab || showEventsTab) && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-blue-100 rounded-3xl p-1">
              {showDiscussionsTab && (
                <button
                  onClick={handleDiscussionsTabClick}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'discussions'
                      ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Discussions
                </button>
              )}
              {showEventsTab && (
                <button
                  onClick={() => selectTab('events')}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'events'
                      ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  Events
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-start gap-6">
          <CommunityRail
            asideRef={asideRef}
            searchRef={searchRef}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            clearSearch={clearSearch}
            showSearchDropdown={showSearchDropdown}
            searchResults={searchResults}
            activeTab={activeTab}
            trendingVisibleCount={trendingVisibleCount}
            discussions={sortedDiscussions}
            categories={categories}
            events={sortedEvents}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
          
          <main ref={mainContentRef} className="flex-1 min-w-0">
            {activeTab === 'discussions' && (
              <DiscussionList discussions={filteredDiscussions} ctaPath="/community/ask" />
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className={`${eventTypeCardClasses(event.event_type)} ${eventTypeCardHoverClasses(event.event_type)} rounded-3xl border border-neutral-200 p-5 transition-colors`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={eventTypePillClasses(event.event_type)}>
                            {EVENT_TYPE_ICONS[event.event_type] || <CalendarDays className="h-3.5 w-3.5" />}
                            {eventTypeLabel(event.event_type)}
                          </span>
                          <span className="text-xs font-medium text-neutral-400">{formatEventDate(event.start_time)}</span>
                        </div>
                        <h3 className="text-lg font-black text-neutral-900">{event.title}</h3>
                        <p className="text-sm text-neutral-600 line-clamp-2 mt-1">{event.description}</p>
                        <div className="mt-3 flex items-center gap-4 text-xs font-medium text-neutral-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location || 'Campus'}
                          </span>
                          {event.max_attendees && (
                            <span>{event.max_attendees} spots</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredEvents.length === 0 && (
                  <div className="text-center py-16 md:py-20 bg-white rounded-3xl border border-neutral-200">
                    <CalendarDays className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-neutral-900 mb-2">No Events Yet</h2>
                    <p className="text-neutral-500 text-sm">
                      Stay tuned for upcoming campus events, workshops, and webinars.
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>

          {showScrollButton && (
            <button
              onClick={scrollToTarget}
              className="fixed bottom-8 right-6 h-10 w-10 rounded-full bg-neutral-200 hover:bg-primary text-neutral-600 hover:text-white flex items-center justify-center shadow-md transition-colors z-50"
              aria-label={isAtBottom ? 'Scroll to top' : 'Scroll to bottom'}
            >
              {isAtBottom ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
