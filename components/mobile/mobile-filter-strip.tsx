'use client'

import * as React from 'react'
import { type LucideIcon } from 'lucide-react'

interface MobileFilterStripProps {
  items: Array<{ id: string; label: string; icon: LucideIcon }>
  selectedId: string
  onSelect: (id: string) => void
  headerHidden: boolean
  onHeaderHiddenChange: (hidden: boolean) => void
  className?: string
}

export function MobileFilterStrip({
  items,
  selectedId,
  onSelect,
  headerHidden,
  onHeaderHiddenChange,
  className = '',
}: MobileFilterStripProps) {
  React.useEffect(() => {
    function handleScroll() {
      onHeaderHiddenChange(window.scrollY > 64)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onHeaderHiddenChange])

  return (
    <>
      {headerHidden && <div className="lg:hidden h-14" aria-hidden="true" />}
      <div
        className={`mobile-opportunity-filters lg:hidden ${
          headerHidden
            ? 'fixed top-0 left-0 right-0 z-[60] bg-blue-50/90 backdrop-blur-md px-4 pt-3 pb-3 shadow-md'
            : 'sticky top-16 z-30 bg-neutral-50 -mx-4 px-4 pb-3'
        } ${className}`}
      >
        <div className="grid grid-cols-5 gap-2">
          {items.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-bold transition-all ${
                  selectedId === item.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
