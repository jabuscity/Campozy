import { HousingService } from '@/services/housing-service'
import { NeighborhoodsClient } from './neighborhoods-client'
import type { Neighborhood, NeighborhoodCampusDistance } from '@/types'

export default async function NeighborhoodsPage({
  searchParams,
}: {
  searchParams: Promise<{ campus?: string }>
}) {
  const params = await searchParams
  const campusId = params.campus || ''

  let rawNeighborhoods: unknown[] = []
  if (campusId) {
    try {
      const data = await HousingService.getNeighborhoodsByCampus(campusId)
      rawNeighborhoods = (data || []) as unknown[]
    } catch {
      rawNeighborhoods = []
    }
  } else {
    rawNeighborhoods = (await HousingService.getNeighborhoods()) as unknown[]
  }

  const neighborhoods: Neighborhood[] = rawNeighborhoods.map((item: unknown) => {
    if (campusId) {
      const typed = item as NeighborhoodCampusDistance & { neighborhoods: Neighborhood }
      return typed.neighborhoods
    }
    return item as Neighborhood
  })

  const neighborhoodsWithCounts = await Promise.all(
    neighborhoods.map(async (neighborhood) => {
      try {
        const properties = await HousingService.getPropertiesByNeighborhood(neighborhood.id)
        return {
          neighborhood,
          propertyCount: (properties || []).length,
        }
      } catch {
        return {
          neighborhood,
          propertyCount: 0,
        }
      }
    }),
  )

  const sorted = [...neighborhoodsWithCounts].sort((a, b) => {
    const scoreA = a.neighborhood.reputation_score ?? 0
    const scoreB = b.neighborhood.reputation_score ?? 0
    return scoreB - scoreA
  })

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <NeighborhoodsClient neighborhoods={sorted.map(({ neighborhood, propertyCount }) => ({ neighborhood, propertyCount }))} />
      </div>
    </div>
  )
}
