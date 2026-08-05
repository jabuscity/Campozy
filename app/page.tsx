import type { Property, Discussion, Opportunity, RoommateMatch, FriendMatch, UtilityReport } from '@/types'
import { HousingService } from '@/services/housing-service'
import { CommunityService } from '@/services/community-service'
import { OpportunityService } from '@/services/opportunity-service'
import { IdentityService } from '@/services/identity-service'
import { StudentService } from '@/services/student-service'
import { UtilityService } from '@/services/utility-service'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Search,
  ShieldCheck,
  Zap,
  Droplet,
  School,
  Home,
  MessageSquare,
  ArrowRight,
  Users,
  Star,
  AlertTriangle,
} from 'lucide-react'
import Image from 'next/image'
import { OnboardingWizard } from '@/components/onboarding-wizard'
import { GuestPrompt } from '@/components/guest-prompt'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ start_onboarding?: string }> | { start_onboarding?: string } }) {
  const params = await searchParams
  const startOnboarding = (params as { start_onboarding?: string }).start_onboarding === '1'

  const currentUser = await IdentityService.getCurrentUser()

  let student = null

  if (currentUser) {
    try {
      student = await StudentService.getStudent(currentUser.id)
    } catch {
      student = null
    }
  }

  const properties = student?.campus_id
    ? await HousingService.getPropertiesByCampus(student.campus_id, { limit: 6, verifiedOnly: true }).catch(() => [])
    : []

  const discussions = await CommunityService.getDiscussions({ limit: 6 }).catch(() => [])

  const opportunities = currentUser
    ? await OpportunityService.getPersonalizedOpportunities(currentUser.id, { limit: 6 }).catch(() => [])
    : await OpportunityService.getOpportunities({ limit: 6 }).catch(() => [])

  const utilityReports = await UtilityService.getRecentReports({ limit: 5 }).catch(() => [])

  const publicProperties = await HousingService.getAllProperties({ limit: 6 }).catch(() => [])

  let roommateMatches: RoommateMatch[] = []
  let friendMatches: FriendMatch[] = []

  if (currentUser) {
    const supabase = await createClient()
    const [roommateResult, friendResult] = await Promise.all([
      supabase.from('roommate_matches').select('*').eq('seeker_id', currentUser.id).order('compatibility_score', { ascending: false }).limit(5),
      supabase.from('friend_matches').select('*').eq('seeker_id', currentUser.id).order('compatibility_score', { ascending: false }).limit(5),
    ])
    roommateMatches = roommateResult.data || []
    friendMatches = friendResult.data || []
  }

  const topProperties = (properties || []).slice(0, 3)
  const trendingDiscussions = (discussions || []).slice(0, 3)
  const topOpportunities = (opportunities || []).slice(0, 3)
  const recentUtilityReports = (utilityReports || []).slice(0, 3)
  const newRoommateMatches = (roommateMatches || []).slice(0, 3)
  const newFriendMatches = (friendMatches || []).slice(0, 3)
  const totalNewMatches = newRoommateMatches.length + newFriendMatches.length

  const needsOnboarding = currentUser ? !currentUser.is_onboarded : false

  const shouldShowOnboarding = needsOnboarding || startOnboarding

  return (
    <div className="flex flex-col min-h-screen text-neutral-900">
      <main className="flex-1 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6">
          {currentUser && student && !needsOnboarding ? (
            <LoggedInFeed
              student={student}
              topProperties={topProperties}
              trendingDiscussions={trendingDiscussions}
              topOpportunities={topOpportunities}
              recentUtilityReports={recentUtilityReports}
              newRoommateMatches={newRoommateMatches}
              newFriendMatches={newFriendMatches}
              totalNewMatches={totalNewMatches}
            />
          ) : (
            <LoggedOutFeed
              properties={(publicProperties || []).slice(0, 3)}
              discussions={(discussions || []).slice(0, 3)}
              opportunities={(opportunities || []).slice(0, 3)}
              utilityReports={(recentUtilityReports || []).slice(0, 3)}
            />
          )}
        </div>
      </main>
      {shouldShowOnboarding && (
        <OnboardingWizard
          isOpen={true}
          onClose={() => {}}
        />
      )}
      {!currentUser && <GuestPrompt />}
    </div>
  )
}

function LoggedInFeed({ student, topProperties, trendingDiscussions, topOpportunities, recentUtilityReports, newRoommateMatches, newFriendMatches, totalNewMatches }: {
  student: unknown
  topProperties: Property[]
  trendingDiscussions: Discussion[]
  topOpportunities: Opportunity[]
  recentUtilityReports: Array<UtilityReport & { property?: { id: string; name: string; neighborhood?: { id: string; name: string } }; utility_type?: { id: string; name: string } }>
  newRoommateMatches: RoommateMatch[]
  newFriendMatches: FriendMatch[]
  totalNewMatches: number
}) {
  const studentRecord = student as Record<string, unknown>
  const campus = studentRecord?.campus as Record<string, unknown> | undefined
  const university = campus?.universities as Record<string, unknown> | undefined
  const studentName = (studentRecord?.profiles as Record<string, unknown>)?.full_name as string | undefined

  return (
    <>
      <section className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
              {(campus?.name as string) || 'Student'} • {(university?.name as string) || 'Campozy Member'}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
              Good to see you, {studentName?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-neutral-600 mt-2">
              Here&apos;s what&apos;s happening around your campus.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/housing">
              <Button className="rounded-full font-bold shadow-sm">
                <Home className="h-4 w-4 mr-2" /> Find Hostels
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="secondary" className="rounded-full font-bold">
                <MessageSquare className="h-4 w-4 mr-2" /> Discussions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8 md:mb-12 hidden lg:block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          {recentUtilityReports.length > 0 && (
            <div className="col-span-1 lg:col-span-8 rounded-xl border border-warning/20 bg-warning/5 p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-grow">
                <h3 className="font-black text-neutral-900 text-sm uppercase tracking-tight">Latest Utility Report</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  {recentUtilityReports[0].utility_type?.name || 'Utility'} reported at {recentUtilityReports[0].property?.name || 'a property'} — {recentUtilityReports[0].comment || 'No details yet'}
                </p>
              </div>
              <Link href="/housing">
                <Button size="sm" className="rounded-full font-bold">View Details</Button>
              </Link>
            </div>
          )}

          {totalNewMatches > 0 && (
            <div className="col-span-1 lg:col-span-4 rounded-xl border border-secondary/20 bg-secondary/5 p-5">
              <h3 className="font-black text-neutral-900 text-sm uppercase tracking-tight mb-3">New Matches</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Roommate matches</span>
                  <span className="font-bold text-neutral-900">{newRoommateMatches.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Friend matches</span>
                  <span className="font-bold text-neutral-900">{newFriendMatches.length}</span>
                </div>
              </div>
              <Link href="/connections" className="mt-3 block">
                <Button variant="secondary" size="sm" className="w-full rounded-full font-bold">
                  View Matches
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {topProperties.length > 0 && (
        <section className="mb-8 md:mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Top Rated Near You</h2>
            <Link href="/housing">
              <Button variant="ghost" className="text-primary font-bold text-sm">
                See all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0 md:mx-0 md:px-0">
            {topProperties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`} className="snap-start flex-shrink-0 w-[280px] md:w-auto md:flex-shrink group">
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-48 bg-neutral-100 relative">
                    {property.property_media?.[0] ? (
                      <Image
                        src={property.property_media[0].url}
                        alt={property.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Home className="h-12 w-12 text-neutral-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant={property.campozy_score >= 75 ? 'success' : 'secondary'} className="font-bold">
                        {property.campozy_score}/100
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-primary transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-3">
                      {property.neighborhoods?.name || 'Unknown area'}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-secondary fill-current" />
                      <span className="text-sm font-bold text-neutral-900">
                        {property.campozy_score >= 90 ? 'Excellent' : property.campozy_score >= 75 ? 'Good' : 'Fair'}
                      </span>
                      <span className="text-xs text-neutral-400 ml-1">Verified</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {trendingDiscussions.length > 0 && (
        <section className="mb-8 md:mb-12 lg:hidden">
          <h2 className="text-xl font-black text-neutral-900 tracking-tight mb-4">Trending Discussions</h2>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
            {trendingDiscussions.map((discussion) => (
              <Link
                key={discussion.id}
                href={`/community`}
                className="snap-start flex-shrink-0 w-[280px] bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-neutral-900 truncate">{discussion.title}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{discussion.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-neutral-400">
                        {discussion.author?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {discussion.reply_count || 0} replies
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {topOpportunities.length > 0 && (
        <section className="mb-8 md:mb-12 lg:hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">Opportunities for You</h2>
            <Link href="/opportunities">
              <Button variant="ghost" className="text-primary font-bold text-sm">
                See all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
            {topOpportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href={`/opportunities/${opportunity.id}`}
                className="snap-start flex-shrink-0 w-[280px] block bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs font-bold uppercase">
                    {opportunity.type}
                  </Badge>
                  {opportunity.is_remote && (
                    <Badge variant="outline" className="text-xs font-bold">Remote</Badge>
                  )}
                </div>
                <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                  {opportunity.title}
                </h3>
                <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                  {opportunity.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    {opportunity.employer?.name || 'Campozy'}
                  </span>
                  {opportunity.deadline && (
                    <span className="text-xs text-neutral-400">
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8 md:mb-12 hidden lg:block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          <Link href="/community">
            <Button variant="ghost" className="text-primary font-bold text-sm">
              See all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {trendingDiscussions.map((discussion) => (
            <Link
              key={discussion.id}
              href={`/community`}
              className="block bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-neutral-900 truncate">{discussion.title}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{discussion.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-neutral-400">
                      {discussion.author?.full_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {discussion.reply_count || 0} replies
                    </span>
                    <span className="text-xs text-neutral-400">
                      {discussion.view_count || 0} views
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8 md:mb-12 hidden lg:block">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Opportunities for You</h2>
          <Link href="/opportunities">
            <Button variant="ghost" className="text-primary font-bold text-sm">
              See all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topOpportunities.map((opportunity) => (
            <Link
              key={opportunity.id}
              href={`/opportunities/${opportunity.id}`}
              className="block bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs font-bold uppercase">
                  {opportunity.type}
                </Badge>
                {opportunity.is_remote && (
                  <Badge variant="outline" className="text-xs font-bold">Remote</Badge>
                )}
              </div>
              <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                {opportunity.title}
              </h3>
              <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                {opportunity.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  {opportunity.employer?.name || 'Campozy'}
                </span>
                {opportunity.deadline && (
                  <span className="text-xs text-neutral-400">
                    Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

function LoggedOutFeed({
  properties = [],
  discussions = [],
  opportunities = [],
  utilityReports = [],
}: {
  properties: Property[]
  discussions: Discussion[]
  opportunities: Opportunity[]
  utilityReports: Array<UtilityReport & { property?: { id: string; name: string; neighborhood?: { id: string; name: string } }; utility_type?: { id: string; name: string } }>
}) {
  return (
    <>
      <section className="relative min-h-[440px] md:min-h-[520px] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl w-full text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-success/10 text-success px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6 border border-success/20">
            <Zap className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <p className="text-xs md:text-sm font-medium">
              {utilityReports.length > 0 ? (
                <>Utility reported <span className="font-bold">{utilityReports[0].utility_type?.name || 'issue'}</span> at {utilityReports[0].property?.name || 'a property'} — {utilityReports[0].comment || 'No details yet'}</>
              ) : (
                <>Water reported <span className="font-bold">ON</span> at Madaraka Estate Residences (10 mins ago)</>
              )}
            </p>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.1] mb-4">
            Decide with <span className="text-primary">Confidence.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Verified student residences. Real utility updates. Zero guesswork.
            The trust network built for students, by students.
          </p>

          <div className="max-w-3xl mx-auto mb-6 md:mb-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                className="w-full h-11 pl-10 pr-16 md:pr-24 rounded-full bg-white border border-neutral-200 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Search hostels, universities, campuses..."
              />
              <Link href="/housing">
                <Button className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 md:px-5 rounded-full font-bold text-xs md:text-sm shadow-sm shadow-primary/20 hover:shadow-md transition-all">
                  Search
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
            <Link href="/housing">
              <button className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary text-white font-bold text-xs md:text-sm transition-all hover:shadow-lg active:scale-95">
                <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="md:inline">Hostels</span>
              </button>
            </Link>
            <Link href="/campuses">
              <button className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-bold text-xs md:text-sm transition-all active:scale-95">
                <School className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="md:inline">Universities</span>
              </button>
            </Link>
            <Link href="/community">
              <button className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-bold text-xs md:text-sm transition-all active:scale-95">
                <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="md:inline">Discussions</span>
              </button>
            </Link>
            <Link href="/opportunities">
              <button className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-bold text-xs md:text-sm transition-all active:scale-95">
                <Droplet className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="md:inline">Opportunities</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {properties.length > 0 && (
        <section className="mb-8 md:mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Top Rated Properties</h2>
            <Link href="/housing">
              <Button variant="ghost" className="text-primary font-bold text-sm">
                See all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0 md:mx-0 md:px-0">
            {properties.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`} className="snap-start flex-shrink-0 w-[280px] md:w-auto md:flex-shrink group">
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-48 bg-neutral-100 relative">
                    {property.property_media?.[0] ? (
                      <Image
                        src={property.property_media[0].url}
                        alt={property.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Home className="h-12 w-12 text-neutral-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant={property.campozy_score >= 75 ? 'success' : 'secondary'} className="font-bold">
                        {property.campozy_score}/100
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-primary transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-3">
                      {property.neighborhoods?.name || 'Unknown area'}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-secondary fill-current" />
                      <span className="text-sm font-bold text-neutral-900">
                        {property.campozy_score >= 90 ? 'Excellent' : property.campozy_score >= 75 ? 'Good' : 'Fair'}
                      </span>
                      <span className="text-xs text-neutral-400 ml-1">Verified</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {discussions.length > 0 && (
        <section className="mb-8 md:mb-12 lg:hidden">
          <h2 className="text-xl font-black text-neutral-900 tracking-tight mb-4">Trending Discussions</h2>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
            {discussions.map((discussion) => (
              <Link
                key={discussion.id}
                href={`/community`}
                className="snap-start flex-shrink-0 w-[280px] bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-neutral-900 truncate">{discussion.title}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{discussion.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-neutral-400">
                        {discussion.author?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {discussion.reply_count || 0} replies
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {opportunities.length > 0 && (
        <section className="mb-8 md:mb-12 lg:hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">Opportunities</h2>
            <Link href="/opportunities">
              <Button variant="ghost" className="text-primary font-bold text-sm">
                See all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
            {opportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href={`/opportunities/${opportunity.id}`}
                className="snap-start flex-shrink-0 w-[280px] block bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs font-bold uppercase">
                    {opportunity.type}
                  </Badge>
                  {opportunity.is_remote && (
                    <Badge variant="outline" className="text-xs font-bold">Remote</Badge>
                  )}
                </div>
                <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                  {opportunity.title}
                </h3>
                <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                  {opportunity.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    {opportunity.employer?.name || 'Campozy'}
                  </span>
                  {opportunity.deadline && (
                    <span className="text-xs text-neutral-400">
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8 md:mb-12 hidden lg:block">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Trending Discussions</h2>
          <Link href="/community">
            <Button variant="ghost" className="text-primary font-bold text-sm">
              See all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {discussions.map((discussion) => (
            <Link
              key={discussion.id}
              href={`/community`}
              className="block bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-neutral-900 truncate">{discussion.title}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{discussion.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-neutral-400">
                      {discussion.author?.full_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {discussion.reply_count || 0} replies
                    </span>
                    <span className="text-xs text-neutral-400">
                      {discussion.view_count || 0} views
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8 md:mb-12 hidden lg:block">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Opportunities</h2>
          <Link href="/opportunities">
            <Button variant="ghost" className="text-primary font-bold text-sm">
              See all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opportunities.map((opportunity) => (
            <Link
              key={opportunity.id}
              href={`/opportunities/${opportunity.id}`}
              className="block bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs font-bold uppercase">
                  {opportunity.type}
                </Badge>
                {opportunity.is_remote && (
                  <Badge variant="outline" className="text-xs font-bold">Remote</Badge>
                )}
              </div>
              <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                {opportunity.title}
              </h3>
              <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                {opportunity.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  {opportunity.employer?.name || 'Campozy'}
                </span>
                {opportunity.deadline && (
                  <span className="text-xs text-neutral-400">
                    Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
