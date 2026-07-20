import { HousingService } from '@/services/housing-service'
import { CampusCard } from '@/components/campus-card'
import type { Campus } from '@/types'

export default async function CampusesPage({
  searchParams,
}: {
  searchParams: { university?: string }
}) {
  const universityId = searchParams.university
  const campuses = await HousingService.getCampuses(universityId)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Campuses
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Discover campuses and their surrounding student housing ecosystems.
          </p>
        </div>

        {campuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(campuses as Campus[]).map((campus) => (
              <CampusCard key={campus.id} campus={campus} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No campuses mapped yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
