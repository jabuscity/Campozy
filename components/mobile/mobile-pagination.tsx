'use client'

import * as React from 'react'

interface MobilePaginationProps {
  visibleCount: number
  totalCount: number
  onLoadMore: () => void
  onBackToTop: () => void
  showBackToTop: boolean
}

export function MobilePagination({
  visibleCount,
  totalCount,
  onLoadMore,
  onBackToTop,
  showBackToTop,
}: MobilePaginationProps) {
  const hasMore = visibleCount < totalCount

  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-bold hover:bg-neutral-200 transition-colors"
        >
          MORE
        </button>
      )}
      {showBackToTop && (
        <button
          onClick={onBackToTop}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-bold hover:bg-neutral-200 transition-colors"
        >
          ↑ Back to top
        </button>
      )}
    </div>
  )
}
