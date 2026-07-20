import { RecommendationService } from '@/services/recommendation-service'
import { createClient } from '@/lib/supabase/server'
import type { RecommendationCandidate } from '@/types'
import Link from 'next/link'
import { Home, MapPin, Briefcase, Star } from 'lucide-react'

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Please sign in to view recommendations.</p>
      </div>
    )
  }

  const recommendations = await RecommendationService.getRecommendations(user.id, 30)

  const grouped = recommendations.reduce<Record<string, RecommendationCandidate[]>>((acc, rec) => {
    if (!acc[rec.entity_type]) acc[rec.entity_type] = []
    acc[rec.entity_type].push(rec)
    return acc
  }, {})

  const entityIcons: Record<string, React.ReactNode> = {
    property: <Home className="h-5 w-5 text-primary" />,
    neighborhood: <MapPin className="h-5 w-5 text-secondary" />,
    business: <Briefcase className="h-5 w-5 text-neutral-500" />,
    opportunity: <Star className="h-5 w-5 text-secondary" />,
  }

  const entityLinks: Record<string, (id: string) => string> = {
    property: (id) => `/property/${id}`,
    neighborhood: (id) => `/neighborhoods/${id}`,
    business: (id) => `/businesses/${id}`,
    opportunity: (id) => `/opportunities/${id}`,
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Recommendations
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Personalized suggestions based on your activity and preferences
          </p>
        </div>

        {recommendations.length > 0 ? (
          <div className="space-y-12">
            {Object.entries(grouped).map(([type, recs]) => (
              <section key={type} className="bg-white rounded-3xl border border-neutral-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  {entityIcons[type]}
                  <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight capitalize">
                    {type}s
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recs.map((rec) => (
                    <Link
                      key={rec.id}
                      href={entityLinks[type](rec.entity_id)}
                      className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-tight">ID: {rec.entity_id.slice(0, 8)}</span>
                        <span className="text-xs font-bold text-primary">{rec.score}/100</span>
                      </div>
                      <p className="text-sm text-neutral-600 line-clamp-2">{rec.reason}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                        <span className="capitalize">{rec.source}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No recommendations yet.</p>
            <p className="text-neutral-400 text-sm mt-2">Save properties, businesses, and opportunities to get personalized suggestions.</p>
          </div>
        )}
      </div>
    </div>
  )
}
