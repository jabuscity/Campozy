import { HousingService } from '@/services/housing-service'
import { createClient } from '@/lib/supabase/server'
import type { PropertyUtility } from '@/types'

export default async function CampusUtilitiesPage({ params }: { params: { id: string } }) {
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

  let utilities: PropertyUtility[] = []
  if (neighborhoodIds.length > 0) {
    const supabase = await createClient()
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .in('neighborhood_id', neighborhoodIds)
      .eq('is_active', true)

    if (properties && properties.length > 0) {
      const propertyIds = properties.map(p => p.id)
      const { data: utilityData } = await supabase
        .from('property_utilities')
        .select(`
          *,
          utility_types(name, icon),
          properties(name, neighborhoods(name))
        `)
        .in('property_id', propertyIds)

      utilities = (utilityData || []) as PropertyUtility[]
    }
  }

  const grouped = utilities.reduce<Record<string, PropertyUtility[]>>((acc, u) => {
    const key = u.utility_type?.name || 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(u)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
            Utilities
          </h1>

        </div>

        {Object.keys(grouped).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type} className="bg-white rounded-3xl border border-neutral-200 p-8">
                <h3 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight">{type}</h3>
                <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100">
                    <div>
                      <p className="font-medium text-neutral-900">Property {item.property_id.slice(0, 8)}</p>
                      <p className="text-sm text-neutral-500">ID: {item.property_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-neutral-900">{item.reliability_score}%</p>
                      <p className="text-xs text-neutral-500">reliability</p>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">None yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
