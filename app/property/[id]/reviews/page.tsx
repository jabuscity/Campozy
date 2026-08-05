import { HousingService } from '@/services/housing-service'
import { TrustService } from '@/services/trust-service'
import Link from 'next/link'
import { Star, ArrowLeft, ThumbsUp } from 'lucide-react'

export default async function PropertyReviewsPage({ params }: { params: { id: string } }) {
  const property = await HousingService.getPropertyById(params.id)
  const reviews = await TrustService.getPropertyReviews(params.id, { limit: 50 })

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Property not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href={`/property/${property.id}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to property
          </Link>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">
            Reviews
          </h1>

        </div>

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-3xl border border-neutral-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600">
                      {review.profiles?.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">
                        {review.profiles?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-neutral-700">
                    <Star className="h-4 w-4 fill-secondary text-secondary" />
                    {review.overall_rating}/5
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {review.safety_rating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-500 w-32">Safety</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${(review.safety_rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-neutral-700 font-medium w-8 text-right">{review.safety_rating}</span>
                    </div>
                  )}
                  {review.hygiene_rating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-500 w-32">Hygiene</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${(review.hygiene_rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-neutral-700 font-medium w-8 text-right">{review.hygiene_rating}</span>
                    </div>
                  )}
                  {review.water_rating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-500 w-32">Water</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${(review.water_rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-neutral-700 font-medium w-8 text-right">{review.water_rating}</span>
                    </div>
                  )}
                  {review.electricity_rating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-500 w-32">Electricity</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${(review.electricity_rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-neutral-700 font-medium w-8 text-right">{review.electricity_rating}</span>
                    </div>
                  )}
                  {review.internet_rating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-500 w-32">Internet</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${(review.internet_rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-neutral-700 font-medium w-8 text-right">{review.internet_rating}</span>
                    </div>
                  )}
                  {review.management_rating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-500 w-32">Management</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${(review.management_rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-neutral-700 font-medium w-8 text-right">{review.management_rating}</span>
                    </div>
                  )}
                  {review.accessibility_rating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-500 w-32">Accessibility</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${(review.accessibility_rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-neutral-700 font-medium w-8 text-right">{review.accessibility_rating}</span>
                    </div>
                  )}
                  {review.value_for_money_rating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-500 w-32">Value</span>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${(review.value_for_money_rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-neutral-700 font-medium w-8 text-right">{review.value_for_money_rating}</span>
                    </div>
                  )}
                </div>

                {review.content && (
                  <p className="text-neutral-600 leading-relaxed">{review.content}</p>
                )}

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpful_count} helpful</span>
                  </div>
                  {review.is_verified_stay && (
                    <span className="text-xs font-bold text-secondary uppercase tracking-tight">
                      Verified Stay
                    </span>
                  )}
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
