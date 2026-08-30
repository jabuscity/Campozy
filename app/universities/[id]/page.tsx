import { HousingService } from '@/services/housing-service'
import { CommunityService } from '@/services/community-service'
import { OpportunityService } from '@/services/opportunity-service'
import { createClient } from '@/lib/supabase/server'
import type { Neighborhood } from '@/types'
import Link from 'next/link'
import { MapPin, Users, Briefcase, ArrowRight } from 'lucide-react'

export default async function UniversityPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const university = await HousingService.getUniversityById(params.id)
  const campuses = await HousingService.getCampuses(university.id)

  const campusIds = campuses.map(c => c.id)
  const discussionsPromise = CommunityService.getDiscussions({
    campusId: campusIds[0] || undefined,
    limit: 5,
  })
  const opportunitiesPromise = OpportunityService.getOpportunities({ limit: 5 })
  const neighborhoodsPromise = HousingService.getNeighborhoods().then(neighborhoods => neighborhoods.slice(0, 6))
  const propertiesPromise = campusIds.length > 0
    ? HousingService.getPropertiesByCampus(campusIds[0], { limit: 6 })
    : Promise.resolve([])
  const reportsPromise = campusIds.length > 0
    ? supabase
        .from('campus_intelligence_reports')
        .select('*')
        .in('campus_id', campusIds)
        .order('created_at', { ascending: false })
        .limit(3)
        .then(({ data }) => data || [])
    : Promise.resolve([])

  const [discussions, opportunities, neighborhoods, properties, reports] = await Promise.all([
    discussionsPromise,
    opportunitiesPromise,
    neighborhoodsPromise,
    propertiesPromise,
    reportsPromise,
  ])

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
                {university.name}
              </h1>

            </div>
            {university.website && (
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 bg-transparent px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-all"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                Campuses
              </h2>
              {campuses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campuses.map((campus) => (
                    <Link
                      key={campus.id}
                      href={`/campuses/${campus.id}`}
                      className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
                    >
                      <h3 className="font-bold text-neutral-900">{campus.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{campus.description}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">None yet.</p>
              )}
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
                <p className="text-neutral-500">Nothing here yet.</p>
              )}
              <Link href="/community" className="mt-4 inline-flex">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all discussions <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </section>

            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                Opportunities
              </h2>
              {opportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.map((opportunity) => (
                    <Link
                      key={opportunity.id}
                      href={`/opportunities/${opportunity.id}`}
                      className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
                    >
                      <h3 className="font-bold text-neutral-900">{opportunity.title}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{opportunity.description}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">Nothing here yet.</p>
              )}
              <Link href="/opportunities" className="mt-4 inline-flex">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all opportunities <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </section>

            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                Neighborhoods
              </h2>
              {neighborhoods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(neighborhoods as Neighborhood[]).map((neighborhood) => (
                    <Link
                      key={neighborhood.id}
                      href={`/neighborhoods/${neighborhood.id}`}
                      className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
                    >
                      <h3 className="font-bold text-neutral-900">{neighborhood.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">
                        {neighborhood.cities?.name || ''} {neighborhood.cities?.countries?.name || ''}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">None yet.</p>
              )}
              <Link href="/neighborhoods" className="mt-4 inline-flex">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all neighborhoods <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </section>

            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                Housing
              </h2>
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {properties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/property/${property.id}`}
                      className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
                    >
                      <h3 className="font-bold text-neutral-900">{property.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{property.description}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">Nothing here yet.</p>
              )}
              <Link href="/discovery" className="mt-4 inline-flex">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all housing <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </section>

            {reports.length > 0 && (
              <section className="bg-white rounded-3xl border border-neutral-200 p-8">
                <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                  Reports
                </h2>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 rounded-2xl border border-neutral-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-neutral-900">Campus Report</span>
                        <span className="text-xs text-neutral-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-500">Properties</p>
                          <p className="font-bold text-neutral-900">{report.active_properties}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Avg Score</p>
                          <p className="font-bold text-neutral-900">{report.avg_campozy_score}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Reviews</p>
                          <p className="font-bold text-neutral-900">{report.review_count}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Contributors</p>
                          <p className="font-bold text-neutral-900">{report.contributor_count}</p>
                        </div>
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
                Quick Facts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">{campuses.length} campus{campuses.length !== 1 ? 'es' : ''}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">{discussions.length} discussion{discussions.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-600">{opportunities.length} opportunit{opportunities.length !== 1 ? 'ies' : 'y'}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
