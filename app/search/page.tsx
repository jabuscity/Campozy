import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, MapPin, GraduationCap, Briefcase, MessageSquare, Users } from 'lucide-react'
import type { Property, Business, Discussion, Opportunity } from '@/types'

type SearchResult = {
  universities: { id: string; name: string; description: string | null }[]
  campuses: { id: string; name: string; description: string | null }[]
  neighborhoods: { id: string; name: string; description: string | null }[]
  properties: Property[]
  businesses: Business[]
  discussions: Discussion[]
  opportunities: Opportunity[]
  alumni: { id: string; current_position: string | null; current_company: string | null; degree: string | null }[]
  founders: { id: string; contribution_score: number; profile: { full_name: string | null } | null }[]
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || ''
  const supabase = await createClient()

  const results: SearchResult = {
    universities: [],
    campuses: [],
    neighborhoods: [],
    properties: [],
    businesses: [],
    discussions: [],
    opportunities: [],
    alumni: [],
    founders: [],
  }

  if (query.trim()) {
    const q = query.trim()
    const [
      uniData,
      campusData,
      neighborhoodData,
      propertyData,
      businessData,
      discussionData,
      opportunityData,
      alumniData,
      founderData,
    ] = await Promise.all([
      supabase.from('universities').select('id, name, description').ilike('name', `%${q}%`).limit(5),
      supabase.from('campuses').select('id, name, description').ilike('name', `%${q}%`).limit(5),
      supabase.from('neighborhoods').select('id, name, description').ilike('name', `%${q}%`).limit(5),
      supabase.from('properties').select('id, name, description').ilike('name', `%${q}%`).limit(5),
      supabase.from('businesses').select('id, name, description, category').ilike('name', `%${q}%`).limit(5),
      supabase.from('discussions').select('id, title, content').ilike('title', `%${q}%`).limit(5),
      supabase.from('opportunities').select('id, title, description').ilike('title', `%${q}%`).limit(5),
      supabase.from('alumni_profiles').select('id, current_position, current_company, degree').or(`current_position.ilike.%${q}%,current_company.ilike.%${q}%,degree.ilike.%${q}%`).limit(5),
      supabase.from('founder_memberships').select('id, contribution_score, profile:profiles(id, full_name)').limit(5),
    ])

    results.universities = uniData.data || []
    results.campuses = campusData.data || []
    results.neighborhoods = neighborhoodData.data || []
    results.properties = (propertyData.data || []) as Property[]
    results.businesses = (businessData.data || []) as Business[]
    results.discussions = (discussionData.data || []) as Discussion[]
    results.opportunities = (opportunityData.data || []) as Opportunity[]
    results.alumni = (alumniData.data || []) as SearchResult['alumni']
    results.founders = (founderData.data || []) as unknown as SearchResult['founders']
  }

  const totalResults = results.universities.length + results.campuses.length + results.neighborhoods.length + results.properties.length + results.businesses.length + results.discussions.length + results.opportunities.length + results.alumni.length + results.founders.length

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Search
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            {query ? `Results for &quot;${query}&quot;` : 'Search across properties, universities, campuses, neighborhoods, businesses, discussions, opportunities, alumni, and founders.'}
          </p>
        </div>

        {query && (
          <div className="mb-8">
            <p className="text-sm text-neutral-500">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {!query ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <Search className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">Enter a search term to find results across Campozy.</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <Search className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">No results found for &quot;{query}&quot;.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {results.universities.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Universities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.universities.map((item) => (
                    <Link key={item.id} href={`/universities/${item.id}`} className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="font-bold text-neutral-900">{item.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.campuses.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Campuses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.campuses.map((item) => (
                    <Link key={item.id} href={`/campuses/${item.id}`} className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="font-bold text-neutral-900">{item.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.neighborhoods.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Neighborhoods
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.neighborhoods.map((item) => (
                    <Link key={item.id} href={`/neighborhoods/${item.id}`} className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="font-bold text-neutral-900">{item.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.properties.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Properties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.properties.map((item) => (
                    <Link key={item.id} href={`/property/${item.id}`} className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="font-bold text-neutral-900">{item.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.businesses.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Businesses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.businesses.map((item) => (
                    <Link key={item.id} href={`/businesses/${item.id}`} className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="font-bold text-neutral-900">{item.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.discussions.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Discussions
                </h2>
                <div className="space-y-4">
                  {results.discussions.map((item) => (
                    <Link key={item.id} href={`/community?discussion=${item.id}`} className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="font-bold text-neutral-900">{item.title}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{item.content}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.opportunities.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Opportunities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.opportunities.map((item) => (
                    <Link key={item.id} href={`/opportunities/${item.id}`} className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="font-bold text-neutral-900">{item.title}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.alumni.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Alumni
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.alumni.map((item) => (
                    <Link key={item.id} href="/alumni" className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="font-bold text-neutral-900">{item.current_position || 'Alumni'}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{item.current_company} • {item.degree}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.founders.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-neutral-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Founders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.founders.map((item) => (
                    <Link key={item.id} href="/founders" className="block p-4 rounded-2xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all">
                      <h3 className="font-bold text-neutral-900">{item.profile?.full_name || 'Founder'}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">Contribution Score: {item.contribution_score}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
