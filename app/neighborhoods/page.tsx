import { HousingService } from '@/services/housing-service'
import { NeighborhoodCard } from '@/components/neighborhood-card'
import type { Neighborhood } from '@/types'

export default async function NeighborhoodsPage() {
  const neighborhoods = await HousingService.getNeighborhoods()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Neighborhoods
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Explore student-friendly neighborhoods across Kenya.
          </p>
        </div>

        {neighborhoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(neighborhoods as Neighborhood[]).map((neighborhood) => (
              <NeighborhoodCard key={neighborhood.id} neighborhood={neighborhood} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No neighborhoods mapped yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
