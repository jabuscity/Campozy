import { HousingService } from '@/services/housing-service'
import { UniversityCard } from '@/components/university-card'
import type { University } from '@/types'

export default async function UniversitiesPage() {
  const universities = await HousingService.getUniversities()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Universities
          </h1>

        </div>

        {universities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(universities as University[]).map((university) => (
              <UniversityCard key={university.id} university={university} />
            ))}
          </div>
        ) : (
            <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-neutral-200">
              <p className="text-neutral-500 text-base md:text-lg">None yet.</p>
            </div>
        )}
      </div>
    </div>
  )
}
