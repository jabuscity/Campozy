'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  CalendarDays,
  MessageCircle,
  TrendingUp,
  Search,
  X,
  GraduationCap,
  Home,
  Camera,
  Heart,
  Star,
  ShoppingCart,
  Cpu,
  Briefcase,
  Megaphone,
} from 'lucide-react'
import type { Discussion, DiscussionCategory, CommunityEvent } from '@/types'

type CommunityTab = 'discussions' | 'events'
type RailItem = {
  id: string
  title: string
  subtitle: string
  href?: string
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

interface Props {
  asideRef: React.RefObject<HTMLDivElement | null>
  searchRef: React.RefObject<HTMLDivElement | null>
  searchQuery: string
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearSearch: () => void
  showSearchDropdown: boolean
  searchResults: RailItem[]
  activeTab: CommunityTab
  trendingVisibleCount: number
  discussions: Discussion[]
  categories: DiscussionCategory[]
  events: CommunityEvent[]
  selectedFilter: string | null
  setSelectedFilter: (v: string | null) => void
}

export default function CommunityRail({
  asideRef,
  searchRef,
  searchQuery,
  onSearch,
  clearSearch,
  showSearchDropdown,
  searchResults,
  activeTab,
  trendingVisibleCount,
  discussions,
  categories,
  events,
  selectedFilter,
  setSelectedFilter,
}: Props) {
  function eventTypeLabel(type: string) {
    return type.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <aside ref={asideRef} className="hidden lg:block w-64 shrink-0 sticky top-20 z-40">
      <div ref={searchRef} className="relative w-full mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={onSearch}
          onFocus={() => searchQuery.trim().length > 0 && searchResults.length > 0 && setTimeout(() => {}, 0)}
          className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-neutral-200 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder={activeTab === 'events' ? 'Search events...' : 'Search discussions...'}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {showSearchDropdown && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  href={result.href || '#'}
                  onClick={() => {}}
                  className="flex items-start gap-3 px-3 py-2.5 hover:bg-neutral-50 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate">{result.title}</p>
                    <p className="text-xs text-neutral-500 line-clamp-1">{result.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeTab === 'discussions' && (
        <div className={`transition-all duration-300 ease-in-out ${trendingVisibleCount < 0 ? 'mb-0' : 'mb-4'} ${trendingVisibleCount < 0 ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-[2000px] opacity-100'}`}>
          <div className={`bg-orange-50 rounded-3xl border-2 border-orange-200 transition-all duration-300 ease-in-out ${trendingVisibleCount === 0 ? 'p-2' : 'p-4'}`}>
            <h3 className={`text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ease-in-out ${trendingVisibleCount === 0 ? 'mb-1 scale-90 origin-top-left' : 'mb-3'}`}>
              <TrendingUp className="h-4 w-4" />
              Trending
            </h3>
            <div className="flex flex-col">
              {discussions.length === 0 ? (
                <p className="text-xs text-neutral-400">No trending discussions yet.</p>
              ) : (
                discussions.slice(0, 5).map((discussion, idx) => {
                  const isVisible = idx < Math.max(0, trendingVisibleCount)
                  return (
                    <Link
                      key={discussion.id}
                      href={`/community?discussion=${discussion.id}`}
                      className={`flex items-start gap-2.5 text-neutral-700 hover:text-primary hover:bg-orange-100/60 rounded-lg px-2 py-1.5 -mx-2 transition-all duration-300 ${
                        isVisible ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden py-0 -my-1.5'
                      }`}
                    >
                      <span className="text-xs font-black text-neutral-400 mt-0.5 w-4 text-center shrink-0">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{discussion.title}</p>
                        <p className="text-[11px] text-neutral-500 line-clamp-1">{discussion.reply_count || 0} replies • {discussion.view_count || 0} views</p>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="transition-all duration-300 ease-in-out mb-4">
          <div className={`bg-orange-50 rounded-3xl border-2 border-orange-200 transition-all duration-300 ease-in-out ${trendingVisibleCount === 0 ? 'p-2' : 'p-4'}`}>
            <h3 className={`text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ease-in-out ${trendingVisibleCount === 0 ? 'mb-1 scale-90 origin-top-left' : 'mb-3'}`}>
              <CalendarDays className="h-4 w-4" />
              Trending Events
            </h3>
            <div className="flex flex-col">
              {events.length === 0 ? (
                <p className="text-xs text-neutral-400">No trending events yet.</p>
              ) : (
                events.slice(0, 5).map((event, idx) => {
                  const isVisible = idx < Math.max(0, trendingVisibleCount)
                  return (
                    <Link
                      key={event.id}
                      href="/community/events"
                      className={`flex items-start gap-2.5 text-neutral-700 hover:text-primary hover:bg-orange-100/60 rounded-lg px-2 py-1.5 -mx-2 transition-all duration-300 ${
                        isVisible ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden py-0 -my-1.5'
                      }`}
                    >
                      <span className="text-xs font-black text-neutral-400 mt-0.5 w-4 text-center shrink-0">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{event.title}</p>
                         <p className="text-[11px] text-neutral-500 line-clamp-1">{eventTypeLabel(event.event_type)} • {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'discussions' && (
        <div className="transition-all duration-300 ease-in-out mb-4">
          <div className="bg-white rounded-3xl border border-neutral-200 p-4 transition-all duration-300 ease-in-out">
            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Topics
            </h3>
            <div className="space-y-1">
              {categories.length === 0 ? (
                <p className="text-xs text-neutral-400">No categories yet.</p>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedFilter(selectedFilter === cat.name ? null : cat.name)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      selectedFilter === cat.name ? 'bg-primary/10 text-primary' : 'text-neutral-700 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    {CATEGORY_ICONS[cat.name] || <MessageCircle className="h-4 w-4" />}
                    {cat.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="transition-all duration-300 ease-in-out mb-4">
          <div className="bg-white rounded-3xl border border-neutral-200 p-4 transition-all duration-300 ease-in-out">
            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Event Types
            </h3>
            <div className="space-y-1">
              {Array.from(new Set(events.map(e => e.event_type).filter(Boolean))).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(selectedFilter === type ? null : type)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    selectedFilter === type ? 'bg-primary/10 text-primary' : 'text-neutral-700 hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  {eventTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
