import { HousingService } from '@/services/housing-service'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function UniversityHousingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const university = await HousingService.getUniversityById(id)
  const campuses = await HousingService.getCampuses(university.id)

  const campusIds = campuses.map(c => c.id)
  let properties: Awaited<ReturnType<typeof HousingService.getPropertiesByCampus>> = []

  if (campusIds.length > 0) {
    const propertyPromises = campusIds.map(campusId =>
      HousingService.getPropertiesByCampus(campusId, { limit: 20 })
    )
    const results = await Promise.all(propertyPromises)
    properties = results.flat()
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
            Housing
          </h1>

        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:border-primary transition-all"
              >
                <h3 className="font-bold text-neutral-900 mb-1">{property.name}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{property.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{property.neighborhood?.name}</span>
                  <span className="font-bold text-primary">{property.campozy_score} score</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">Nothing here yet.</p>
            <Link href="/discovery" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Browse all housing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
