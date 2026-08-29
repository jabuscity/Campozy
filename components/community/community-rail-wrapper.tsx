'use client'

import * as React from 'react'
import CommunityRail from './community-rail'
import type { Discussion, DiscussionCategory } from '@/types'
import type { CommunityEvent } from '@/services/community-service'

interface Props {
  activeTab?: 'discussions' | 'events'
  discussions?: Discussion[]
  categories?: DiscussionCategory[]
  events?: CommunityEvent[]
}

export default function CommunityRailWrapper({
  activeTab = 'discussions',
  discussions = [],
  categories = [],
  events = [],
}: Props) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false)
  const [trendingVisibleCount, setTrendingVisibleCount] = React.useState(5)
  const [selectedFilter, setSelectedFilter] = React.useState<string | null>(null)

  const asideRef = React.useRef<HTMLDivElement | null>(null)
  const searchRef = React.useRef<HTMLDivElement | null>(null)

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setSearchQuery(v)
    setShowSearchDropdown(v.trim().length > 0 && searchResults.length > 0)
  }

  function clearSearch() {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchDropdown(false)
  }

  return (
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
      discussions={discussions}
      categories={categories}
      events={events}
      selectedFilter={selectedFilter}
      setSelectedFilter={setSelectedFilter}
    />
  )
}
