import { HousingService } from '@/services/housing-service'
import { CommunityService } from '@/services/community-service'
import { OpportunityService } from '@/services/opportunity-service'
import { BusinessService } from '@/services/business-service'
import type { Business, Discussion, Opportunity, Property } from '@/types'
import Link from 'next/link'
import { MapPin, Users, Briefcase, ArrowRight } from 'lucide-react'

export default async function CampusPage({ params }: { params: { id: string } }) {
  const campus = await HousingService.getCampuses().then(campuses => campuses.find(c => c.id === params.id) || null)
  
  let discussions: Discussion[] = []
  let opportunities: Opportunity[] = []
  let properties: Property[] = []
  let businesses: Business[] = []

  if (campus) {
    const neighborhoodDistances = await HousingService.getNeighborhoodsByCampus(campus.id)
    const neighborhoodIds = neighborhoodDistances.map(d => d.neighborhoods.id)
    
    const [discussionsData, opportunitiesData, propertiesData, businessesData] = await Promise.all([
      CommunityService.getDiscussions({ campusId: campus.id, limit: 5 }),
      OpportunityService.getOpportunities({ limit: 5 }),
      HousingService.getPropertiesByCampus(campus.id, { limit: 6 }),
      neighborhoodIds.length > 0
        ? BusinessService.getBusinesses({ limit: 6 })
        : Promise.resolve([]),
    ])
    discussions = discussionsData
    opportunities = opportunitiesData
    properties = propertiesData
    businesses = businessesData
  }

  if (!campus) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Campus not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            {campus.name}
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
                {campus.university?.name || 'Independent Campus'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                About
              </h2>
              <p className="text-neutral-500 leading-relaxed">
                {campus.description || 'No description available for this campus.'}
              </p>
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
                <p className="text-neutral-500">No properties listed near this campus yet.</p>
              )}
              <Link href="/discovery">
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all housing <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
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
                <p className="text-neutral-500">No opportunities posted yet.</p>
              )}
              <Link href="/opportunities">
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all opportunities <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </section>

            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                Businesses
              </h2>
              {businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businesses.map((business) => (
                    <Link
                      key={business.id}
                      href={`/businesses/${business.id}`}
                      className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
                    >
                      <h3 className="font-bold text-neutral-900">{business.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{business.description}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">No businesses listed near this campus yet.</p>
              )}
              <Link href="/businesses">
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  View all businesses <ArrowRight className="h-4 w-4" />
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
                  <span className="text-neutral-600">{campus.university?.name || 'Independent'}</span>
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
