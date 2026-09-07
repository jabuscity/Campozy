'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, MapPin, SlidersHorizontal, Wifi, Car, ShieldCheck, Flame, Dumbbell, Waves, BookOpen, ArrowUpDown, Clock } from 'lucide-react'
import type { Property } from '@/types'

interface NeighborhoodRailProps {
  properties: Property[]
  selectedSort: string
  selectedAmenities: string[]
  minPrice?: number
  maxPrice?: number
}

const SORT_OPTIONS = [
  { value: 'highest_score', label: 'Highest Score', icon: ArrowUpDown },
  { value: 'price', label: 'Price', icon: ArrowUpDown },
  { value: 'latest', label: 'Newest', icon: Clock },
]

const AMENITY_OPTIONS = [
  { name: 'Wi-Fi', label: 'Wi-Fi', icon: Wifi },
  { name: 'Parking', label: 'Parking', icon: Car },
  { name: 'Security', label: 'Security', icon: ShieldCheck },
  { name: 'Generator', label: 'Generator', icon: Flame },
  { name: 'Borehole', label: 'Borehole', icon: Waves },
  { name: 'CCTV', label: 'CCTV', icon: ShieldCheck },
  { name: 'Gym', label: 'Gym', icon: Dumbbell },
  { name: 'Laundry', label: 'Laundry', icon: BookOpen },
]

export default function NeighborhoodRail({
  properties,
  selectedSort,
  selectedAmenities,
  minPrice,
  maxPrice,
}: NeighborhoodRailProps) {
  const router = useRouter()
  const asideRef = React.useRef<HTMLDivElement | null>(null)
  const searchRef = React.useRef<HTMLDivElement | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false)

  const sortedProperties = [...properties].sort((a, b) => (b.campozy_score || 0) - (a.campozy_score || 0))

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return []
    const lower = searchQuery.toLowerCase()
    return sortedProperties
      .filter(p =>
        p.name.toLowerCase().includes(lower) ||
        (p.address || '').toLowerCase().includes(lower) ||
        (p.description || '').toLowerCase().includes(lower)
      )
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.name,
        subtitle: p.address || p.description || '',
        href: `/property/${p.id}`,
      }))
  }, [searchQuery, sortedProperties])

  function handleSortClick(sort: string) {
    const params = new URLSearchParams(window.location.search)
    if (sort === 'price') {
      const current = params.get('sort')
      params.set('sort', current === 'price_desc' ? 'price_asc' : 'price_desc')
    } else {
      params.set('sort', sort)
    }
    router.replace(`?${params.toString()}`)
  }

  function handlePriceSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const formData = new FormData(form)
    const params = new URLSearchParams(window.location.search)

    const minPrice = formData.get('minPrice')
    const maxPrice = formData.get('maxPrice')

    if (minPrice) params.set('minPrice', minPrice as string)
    else params.delete('minPrice')

    if (maxPrice) params.set('maxPrice', maxPrice as string)
    else params.delete('maxPrice')

    router.replace(`?${params.toString()}`)
  }

  function toggleAmenity(name: string) {
    const next = selectedAmenities.includes(name)
      ? selectedAmenities.filter(a => a !== name)
      : [...selectedAmenities, name]
    const params = new URLSearchParams(window.location.search)
    if (next.length > 0) params.set('amenities', next.join(','))
    else params.delete('amenities')
    router.replace(`?${params.toString()}`)
  }

  return (
    <aside ref={asideRef} className="hidden lg:block w-64 shrink-0 sticky top-20 z-40 space-y-6">
      <div ref={searchRef} className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
            setShowSearchDropdown(e.target.value.trim().length > 0)
          }}
          onFocus={() => searchQuery.trim().length > 0 && searchResults.length > 0 && setShowSearchDropdown(true)}
          className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-neutral-200 text-sm font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          placeholder="Search hostels..."
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setShowSearchDropdown(false)
            }}
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
                  href={result.href}
                  onClick={() => setShowSearchDropdown(false)}
                  className="flex items-start gap-3 px-3 py-2.5 hover:bg-neutral-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
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

      <div className="bg-orange-50 rounded-3xl border-2 border-orange-200 p-5">
        <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-2">Amenities</p>
        <div className="grid grid-cols-4 gap-2">
          {AMENITY_OPTIONS.map(({ name, label, icon: Icon }) => {
            const active = selectedAmenities.includes(name)
            return (
              <button
                key={name}
                type="button"
                title={label}
                onClick={() => toggleAmenity(name)}
                className={`flex items-center justify-center rounded-xl border px-2 py-2 transition-colors cursor-pointer ${
                  active
                    ? 'border-primary bg-primary text-white'
                    : 'border-neutral-200 text-neutral-600 hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
          </div>

          <div className="border-t border-orange-200/60" />

          <div>
            <p className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-2">Sort By</p>
            <div className="space-y-1">
              {SORT_OPTIONS.map((option) => {
                const isActive = option.value === 'price'
                  ? selectedSort === 'price_asc' || selectedSort === 'price_desc'
                  : selectedSort === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSortClick(option.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-neutral-700 hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-orange-200/60" />

          <form onSubmit={handlePriceSubmit}>
            <p className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-2">Price Range</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">Min price</label>
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={minPrice}
                  placeholder="Min price"
                  className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">Max price</label>
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={maxPrice}
                  placeholder="Max price"
                  className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </aside>
  )
}
