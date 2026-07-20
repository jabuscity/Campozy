import { HousingService } from '@/services/housing-service'
import { CommunityService } from '@/services/community-service'
import Link from 'next/link'
import { MapPin, Users, ArrowRight } from 'lucide-react'

export default async function NeighborhoodPage({ params }: { params: { id: string } }) {
  const neighborhoods = await HousingService.getNeighborhoods()
  const neighborhood = neighborhoods.find(n => n.id === params.id) || null

  if (!neighborhood) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Neighborhood not found.</p>
      </div>
    )
  }

  const discussions = neighborhood.city_id
    ? await CommunityService.getDiscussions({ neighborhoodId: neighborhood.id, limit: 5 })
    : []

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            {neighborhood.name}
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            {neighborhood.cities?.name || ''} {neighborhood.cities?.countries?.name || ''}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                About
              </h2>
              <p className="text-neutral-500 leading-relaxed">
                {neighborhood.description || 'No description available for this neighborhood.'}
              </p>
            </section>

            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                Discussions
              </h2>
              {discussions.length > 0 ? (
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="p-4 rounded-2xl border border-neutral-200 hover:border-primary transition-all"
                    >
                      <h3 className="font-bold text-neutral-900">{discussion.title}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{discussion.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">No discussions yet.</p>
              )}
              <Link href="/community">
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all discussions <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h3 className="text-lg font-black text-neutral-900 mb-4 uppercase tracking-tight">
                Quick Facts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    {neighborhood.cities?.name || ''} {neighborhood.cities?.countries?.name || ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">{discussions.length} discussion{discussions.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
