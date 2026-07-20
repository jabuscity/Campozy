import { HousingService } from '@/services/housing-service'
import type { Neighborhood } from '@/types'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function UniversityNeighborhoodsPage({ params }: { params: { id: string } }) {
  const university = await HousingService.getUniversityById(params.id)
  const campuses = await HousingService.getCampuses(university.id)

  const neighborhoods: Neighborhood[] = []
  for (const campus of campuses) {
    const distances = await HousingService.getNeighborhoodsByCampus(campus.id)
    neighborhoods.push(...distances.map(d => d.neighborhoods))
  }

  const unique = Array.from(new Map(neighborhoods.map(n => [n.id, n])).values())

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Neighborhoods
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Student-friendly neighborhoods near {university.name}
          </p>
        </div>

        {unique.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unique.map((neighborhood) => (
              <Link
                key={neighborhood.id}
                href={`/neighborhoods/${neighborhood.id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:border-primary transition-all"
              >
                <h3 className="font-bold text-neutral-900 mb-1">{neighborhood.name}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2">
                  {neighborhood.cities?.name} {neighborhood.cities?.countries?.name}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No neighborhoods mapped near this university yet.</p>
            <Link href="/neighborhoods" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Browse all neighborhoods <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
