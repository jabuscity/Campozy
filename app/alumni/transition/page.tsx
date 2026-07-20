import { LifecycleService } from '@/services/lifecycle-service'
import { HousingService } from '@/services/housing-service'
import { createClient } from '@/lib/supabase/server'
import type { TransitionRecommendation } from '@/types'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function AlumniTransitionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Please sign in to view your transition plan.</p>
      </div>
    )
  }

  const profile = await LifecycleService.getTransitionProfile(user.id)
  const recommendations = profile ? await LifecycleService.getTransitionRecommendations(profile.id) : []
  const events = profile ? await LifecycleService.getTransitionEvents(profile.id) : []

  let properties: Awaited<ReturnType<typeof HousingService.getPropertiesByCampus>> = []
  if (profile?.target_city_id) {
    const neighborhoods = await HousingService.getNeighborhoods()
    const cityNeighborhoods = neighborhoods.filter(n => n.city_id === profile.target_city_id)
    const neighborhoodIds = cityNeighborhoods.map(n => n.id)
    if (neighborhoodIds.length > 0) {
      const propertyPromises = neighborhoodIds.map(nid =>
        HousingService.getPropertiesByNeighborhood(nid).then(props => props.slice(0, 5))
      )
      const results = await Promise.all(propertyPromises)
      properties = results.flat().slice(0, 10)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Akwet Transition
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Your transition plan from campus to career
          </p>
        </div>

        {profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-3xl border border-neutral-200 p-8">
                <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                  Your Transition Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-500 mb-1">Target City</p>
                    <p className="text-lg font-black text-neutral-900">
                      {profile.target_city?.name || 'Not set'}
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-500 mb-1">Target Move Date</p>
                    <p className="text-lg font-black text-neutral-900">
                      {profile.target_move_date ? new Date(profile.target_move_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-500 mb-1">Budget Range</p>
                    <p className="text-lg font-black text-neutral-900">
                      {profile.budget_range_min && profile.budget_range_max
                        ? `${profile.budget_range_min} — ${profile.budget_range_max}`
                        : 'Not set'}
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-500 mb-1">Housing Preference</p>
                    <p className="text-lg font-black text-neutral-900">
                      {profile.housing_type_preference?.join(', ') || 'Not set'}
                    </p>
                  </div>
                </div>
              </section>

              {properties.length > 0 && (
                <section className="bg-white rounded-3xl border border-neutral-200 p-8">
                  <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                    Recommended Properties
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {properties.map((property) => (
                      <Link
                        key={property.id}
                        href={`/property/${property.id}`}
                        className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
                      >
                        <h3 className="font-bold text-neutral-900">{property.name}</h3>
                        <p className="text-sm text-neutral-500 line-clamp-2">{property.description}</p>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-neutral-500">{property.neighborhood?.name}</span>
                          <span className="font-bold text-primary">{property.campozy_score} score</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {recommendations.length > 0 && (
                <section className="bg-white rounded-3xl border border-neutral-200 p-8">
                  <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                    Smart Recommendations
                  </h2>
                  <div className="space-y-4">
                    {recommendations.map((rec: TransitionRecommendation) => (
                      <div key={rec.id} className="p-4 rounded-2xl border border-neutral-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-neutral-900 capitalize">{rec.entity_type}</span>
                          <span className="text-xs text-neutral-400">Score: {rec.score}/100</span>
                        </div>
                        <p className="text-sm text-neutral-600">{rec.reasoning || 'Recommended based on your profile'}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
                          {rec.is_viewed && <span>Viewed</span>}
                          {rec.is_saved && <span>• Saved</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-8">
              <section className="bg-white rounded-3xl border border-neutral-200 p-8">
                <h3 className="text-lg font-black text-neutral-900 mb-4 uppercase tracking-tight">
                  Transition Progress
                </h3>
                <div className="space-y-4">
                  {events.length > 0 ? events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 capitalize">{event.event_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-neutral-400">{new Date(event.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-neutral-500">No transition events yet.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No transition profile yet.</p>
            <p className="text-neutral-400 text-sm mt-2">Complete your alumni profile to start your Akwet transition plan.</p>
            <Link href="/alumni" className="mt-6 inline-flex">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Go to Alumni <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
