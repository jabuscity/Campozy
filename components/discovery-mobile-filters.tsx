'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, MapPin, Star, X } from 'lucide-react'

interface FilterOption {
  label: string
  value: string
  icon?: React.ReactNode
}

const sortOptions: FilterOption[] = [
  { label: 'Highest Score', value: 'highest_score', icon: <Star className="h-4 w-4" /> },
  { label: 'Price: Low to High', value: 'price_asc', icon: <span className="text-xs font-bold">KES</span> },
  { label: 'Latest', value: 'latest', icon: <span className="text-xs font-bold">NEW</span> },
]

interface DiscoveryMobileFiltersProps {
  currentSort: string
}

export function DiscoveryMobileFilters({ currentSort }: DiscoveryMobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className="fixed bottom-20 right-4 z-40 rounded-full shadow-2xl px-6 gap-2 h-12 lg:hidden"
        onClick={() => setIsOpen(true)}
      >
        <SlidersHorizontal className="h-5 w-5" /> Filters
      </Button>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Filters">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-tight mb-3">Sort By</h4>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    currentSort === option.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  {option.icon}
                  <span className="font-bold text-sm">{option.label}</span>
                  {currentSort === option.value && (
                    <span className="ml-auto text-xs font-bold uppercase">Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-tight mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl">
                <MapPin className="h-4 w-4 mr-2" /> Map View
              </Button>
              <Button variant="outline" className="h-12 rounded-xl">
                <X className="h-4 w-4 mr-2" /> Clear All
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}
