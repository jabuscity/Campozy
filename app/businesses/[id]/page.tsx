import { BusinessService } from '@/services/business-service'
import Link from 'next/link'
import { MapPin, Star, ArrowLeft, ExternalLink } from 'lucide-react'

export default async function BusinessPage({ params }: { params: { id: string } }) {
  const business = await BusinessService.getBusinessById(params.id)

  if (!business) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Business not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/businesses" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to businesses
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">
                {business.name}
              </h1>

            </div>
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 bg-transparent px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-all"
              >
                Visit Website <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                About
              </h2>
              <p className="text-neutral-500 leading-relaxed">
                {business.description || 'No description available.'}
              </p>
            </section>

            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                Reviews
              </h2>
              {business.reviews && business.reviews.length > 0 ? (
                <div className="space-y-6">
                  {business.reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-neutral-100 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600">
                          {review.reviewer?.full_name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-sm">
                            {review.reviewer?.full_name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-sm font-bold text-neutral-700">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          {review.rating}/5
                        </div>
                      </div>
                      {review.content && (
                        <p className="text-neutral-600 text-sm leading-relaxed">{review.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">None yet.</p>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h3 className="text-lg font-black text-neutral-900 mb-4 uppercase tracking-tight">
                Details
              </h3>
              <div className="space-y-3">
                {business.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-500 w-32">Phone:</span>
                    <span className="text-neutral-700">{business.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-neutral-500 w-32">Verified:</span>
                  <span className="text-neutral-700">{business.verification_level}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-neutral-500 w-32">Score:</span>
                  <span className="text-neutral-700">{business.campozy_score}/100</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
