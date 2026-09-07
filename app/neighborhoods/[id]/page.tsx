import { HousingService } from '@/services/housing-service'
import { supabaseAdmin } from '@/lib/supabase/admin'
import NeighborhoodRail from '@/components/neighborhood-rail'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import NeighborhoodPropertyGrid from '@/components/neighborhood-property-grid'

const SORT_OPTIONS = [
  { value: 'highest_score', label: 'Highest Score' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'latest', label: 'Newest' },
] as const

export default async function NeighborhoodPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ minPrice?: string; maxPrice?: string; minScore?: string; sort?: string; amenities?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined
  const minScore = sp.minScore ? Number(sp.minScore) : undefined
  const sortBy = (sp.sort as 'highest_score' | 'price_asc' | 'price_desc' | 'latest') || 'highest_score'
  const selectedAmenities = sp.amenities ? sp.amenities.split(',').map(a => a.trim()).filter(Boolean) : []

  const neighborhood = await HousingService.getNeighborhoodById(id)

  if (!neighborhood) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Neighborhood not found.</p>
      </div>
    )
  }

  const properties = await HousingService.getPropertiesByNeighborhood(neighborhood.id, {
    minPrice,
    maxPrice,
    minScore,
    sort: sortBy,
  })

  const utilities = await HousingService.getUtilityTypes()
  const utilityNameMap = new Map(
    utilities.map(t => [t.id, (t.name || '').toLowerCase()])
  )

  const { data: amenities } = await supabaseAdmin
    .from('amenities')
    .select('id, name')

  const amenityNameMap = new Map(
    (amenities || []).map((t: { id: string; name: string }) => [t.id, (t.name || '').toLowerCase()])
  )

  const filteredProperties = selectedAmenities.length > 0
    ? properties.filter(property => {
        const utilityNames = (property.utilities || []).map(u => utilityNameMap.get(u.utility_id) || '')
        const amenityNames = (property.amenities || []).map(a => amenityNameMap.get(a.amenity_id) || '')
        const allNames = [...utilityNames, ...amenityNames]
        return selectedAmenities.every(selected => allNames.includes(selected.toLowerCase()))
      })
    : properties

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
              {neighborhood.name}
            </h1>
            <p className="text-neutral-600 mt-2">{neighborhood.description || 'Explore hostels in this neighborhood.'}</p>
          </div>

        <div className="flex items-start gap-6">
          <NeighborhoodRail
            properties={filteredProperties}
            selectedSort={sortBy}
            selectedAmenities={selectedAmenities}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />

          <main className="flex-1 min-w-0 space-y-8">
            <section className="lg:hidden bg-white rounded-3xl border border-neutral-200 p-4 md:p-6">
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

            <NeighborhoodPropertyGrid properties={filteredProperties} />
            <Link href="/housing" className="mt-4 inline-flex">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all hostels <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
          </main>
        </div>
      </div>
    </div>
  )
}
