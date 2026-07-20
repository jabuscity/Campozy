import { HousingService } from '@/services/housing-service'
import { createClient } from '@/lib/supabase/server'
import type { HygieneReport } from '@/types'

export default async function CampusHygienePage({ params }: { params: { id: string } }) {
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

  let reports: HygieneReport[] = []
  if (neighborhoodIds.length > 0) {
    const supabase = await createClient()
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .in('neighborhood_id', neighborhoodIds)
      .eq('is_active', true)

    if (properties && properties.length > 0) {
      const propertyIds = properties.map(p => p.id)
      const { data: hygieneData } = await supabase
        .from('hygiene_reports')
        .select(`
          *,
          category:hygiene_categories(name, icon),
          properties(name)
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(30)

      reports = (hygieneData || []) as HygieneReport[]
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Hygiene
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Hygiene reports and cleanliness insights for properties near {campus.name}
          </p>
        </div>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-neutral-900">Property {report.property_id.slice(0, 8)}</span>
                  <span className="text-xs text-neutral-400">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-neutral-500">Category:</span>
                    <span className="text-sm font-medium text-neutral-900">{report.category?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-neutral-500">Score:</span>
                    <span className="text-lg font-black text-neutral-900">{report.score}/10</span>
                  </div>
                </div>
                {report.comment && (
                  <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{report.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No hygiene reports available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
