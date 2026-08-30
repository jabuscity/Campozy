import { HousingService } from '@/services/housing-service'
import { BusinessService } from '@/services/business-service'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function CampusBusinessesPage({ params }: { params: { id: string } }) {
  const campus = await HousingService.getCampuses().then(campuses => campuses.find(c => c.id === params.id) || null)
  if (!campus) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Campus not found.</p>
      </div>
    )
  }

  const neighborhoodDistances = await HousingService.getNeighborhoodsByCampus(campus.id)
  const neighborhoodIds = neighborhoodDistances.map(d => d.neighborhoods.id)

  let businesses: Awaited<ReturnType<typeof BusinessService.getBusinesses>> = []
  if (neighborhoodIds.length > 0) {
    const businessPromises = neighborhoodIds.map(nid =>
      BusinessService.getBusinesses({ neighborhoodId: nid, limit: 20 })
    )
    const results = await Promise.all(businessPromises)
    businesses = results.flat()
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
            Businesses
          </h1>

        </div>

        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/businesses/${business.id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:border-primary transition-all"
              >
                <h3 className="font-bold text-neutral-900 mb-1">{business.name}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{business.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{business.neighborhood_id ? `Neighborhood ${business.neighborhood_id.slice(0, 8)}` : 'Location unknown'}</span>
                  <span className="font-bold text-primary">{business.campozy_score} score</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">Nothing here yet.</p>
            <Link href="/businesses" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Browse all businesses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
