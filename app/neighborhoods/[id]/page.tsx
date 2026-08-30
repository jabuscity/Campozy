import { HousingService } from '@/services/housing-service'
import { CommunityService } from '@/services/community-service'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MapPin, Users, ArrowRight, SlidersHorizontal, ShieldCheck } from 'lucide-react'
import { PropertyCard } from '@/components/property-card'

const SORT_OPTIONS = [
  { value: 'highest_score', label: 'Highest Score' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'latest', label: 'Newest' },
] as const

export default async function NeighborhoodPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ minPrice?: string; maxPrice?: string; minScore?: string; sort?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined
  const minScore = sp.minScore ? Number(sp.minScore) : undefined
  const sortBy = (sp.sort as 'highest_score' | 'price_asc' | 'latest') || 'highest_score'

  const neighborhood = await HousingService.getNeighborhoodById(id)

  if (!neighborhood) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Neighborhood not found.</p>
      </div>
    )
  }

  const discussions = neighborhood.city_id
    ? await CommunityService.getDiscussions({ neighborhoodId: neighborhood.id, limit: 5 })
    : []

  const properties = await HousingService.getPropertiesByNeighborhood(neighborhood.id, {
    minPrice,
    maxPrice,
    minScore,
    sort: sortBy,
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
            {neighborhood.name}
          </h1>
          <p className="text-neutral-600 mt-2">{neighborhood.description || 'Explore hostels in this neighborhood.'}</p>
        </div>

        <section className="bg-white rounded-3xl border border-neutral-200 p-4 md:p-6 mb-6 md:mb-8">
          <form className="flex flex-col md:flex-row gap-3">
            <div className="flex flex-col sm:flex-row gap-2 flex-grow">
              <input
                type="number"
                name="minPrice"
                defaultValue={minPrice}
                placeholder="Min price"
                className="w-full sm:w-auto px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="number"
                name="maxPrice"
                defaultValue={maxPrice}
                placeholder="Max price"
                className="w-full sm:w-auto px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <select
                name="sort"
                defaultValue={sortBy}
                className="w-full sm:w-auto px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full sm:w-auto rounded-full font-bold">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filter
            </Button>
          </form>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                About
              </h2>
              <p className="text-neutral-500 leading-relaxed">
                {neighborhood.description || 'No description available for this neighborhood.'}
              </p>
            </section>

            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                Hostels
              </h2>
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">Nothing here yet.</p>
              )}
              <Link href="/housing" className="mt-4 inline-flex">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all hostels <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h3 className="text-lg font-black text-neutral-900 mb-4 uppercase tracking-tight">
                Quick Facts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    {neighborhood.cities?.name || ''} {neighborhood.cities?.country?.name || ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">{discussions.length} discussion{discussions.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">Safety score: {neighborhood.safety_score ?? 'N/A'}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
