import { HousingService } from '@/services/housing-service'
import { createClient } from '@/lib/supabase/server'
import type { PropertyReview } from '@/types'

export default async function CampusReviewsPage({ params }: { params: { id: string } }) {
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

  let reviews: PropertyReview[] = []
  if (neighborhoodIds.length > 0) {
    const supabase = await createClient()
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .in('neighborhood_id', neighborhoodIds)
      .eq('is_active', true)

    if (properties && properties.length > 0) {
      const propertyIds = properties.map(p => p.id)
      const { data: reviewData } = await supabase
        .from('property_reviews')
        .select(`
          *,
          reviewer:profiles!property_reviews_user_id_fkey(full_name, avatar_url)
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(30)

      reviews = (reviewData || []) as PropertyReview[]
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Reviews
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Student reviews for properties near {campus.name}
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-neutral-900">
                    {review.reviewer?.full_name || 'Student'}
                  </span>
                  <span className="text-xs text-neutral-400">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-lg font-black text-neutral-900">{review.overall_rating}/10</span>
                  {review.is_verified_stay && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Verified Stay</span>
                  )}
                </div>
                {review.content && (
                  <p className="text-sm text-neutral-600 line-clamp-3">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No reviews available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
