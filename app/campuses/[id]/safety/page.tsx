import { HousingService } from '@/services/housing-service'
import { createClient } from '@/lib/supabase/server'
import type { PropertyReview, NeighborhoodReview } from '@/types'

export default async function CampusSafetyPage({ params }: { params: { id: string } }) {
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

  const supabase = await createClient()

  let propertyReviews: PropertyReview[] = []
  let neighborhoodReviews: NeighborhoodReview[] = []

  if (neighborhoodIds.length > 0) {
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .in('neighborhood_id', neighborhoodIds)
      .eq('is_active', true)

    if (properties && properties.length > 0) {
      const propertyIds = properties.map(p => p.id)
      const { data: pReviews } = await supabase
        .from('property_reviews')
        .select(`
          *,
          reviewer:profiles!property_reviews_user_id_fkey(full_name)
        `)
        .in('property_id', propertyIds)
        .not('safety_rating', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20)

      propertyReviews = (pReviews || []) as PropertyReview[]
    }

    const { data: nReviews } = await supabase
      .from('neighborhood_reviews')
      .select(`
        *,
        reviewer:profiles!neighborhood_reviews_user_id_fkey(full_name)
      `)
      .in('neighborhood_id', neighborhoodIds)
      .not('safety_rating', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20)

    neighborhoodReviews = (nReviews || []) as NeighborhoodReview[]
  }

  const allReviews = [
    ...propertyReviews.map(r => ({ ...r, source: 'Property' as const })),
    ...neighborhoodReviews.map(r => ({ ...r, source: 'Neighborhood' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Safety
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Safety ratings and reports from the community
          </p>
        </div>

        {allReviews.length > 0 ? (
          <div className="space-y-4">
            {allReviews.map((review) => (
              <div key={`${review.source}-${review.id}`} className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-tight">{review.source}</span>
                  <span className="text-xs text-neutral-400">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-neutral-500">Safety:</span>
                    <span className="text-lg font-black text-neutral-900">{review.safety_rating}/10</span>
                  </div>
                  {review.source === 'Neighborhood' && 'transport_rating' in review && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-neutral-500">Transport:</span>
                      <span className="text-lg font-black text-neutral-900">{review.transport_rating}/10</span>
                    </div>
                  )}
                  {review.source === 'Neighborhood' && 'amenities_rating' in review && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-neutral-500">Amenities:</span>
                      <span className="text-lg font-black text-neutral-900">{review.amenities_rating}/10</span>
                    </div>
                  )}
                </div>
                {review.content && (
                  <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No safety reports available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
