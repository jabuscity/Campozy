'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Campus = {
  id: string
  name: string
}

export function DiscoveryControls({
  campuses,
  query,
  campusId,
}: {
  campuses: Campus[]
  query: string
  campusId?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateSearch(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/discovery?${params.toString()}`)
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>

        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />

          <input
            type="text"
            placeholder="Search neighborhood or hostel..."
            className="w-full pl-10 pr-4 h-11 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            defaultValue={query}
            onChange={(e) => updateSearch('q', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Badge
          variant={!campusId ? 'default' : 'outline'}
          className="py-2 px-6 rounded-xl cursor-pointer"
          onClick={() => updateSearch('campus')}
        >
          All Campuses
        </Badge>

        {campuses.map((campus) => (
          <Badge
            key={campus.id}
            variant={campusId === campus.id ? 'default' : 'outline'}
            className="py-2 px-6 rounded-xl cursor-pointer hover:bg-neutral-50 whitespace-nowrap"
            onClick={() => updateSearch('campus', campus.id)}
          >
            {campus.name}
          </Badge>
        ))}
      </div>
    </>
  )
}