import { OpportunityService } from '@/services/opportunity-service'
import { OpportunityCard } from '@/components/opportunity-card'
import { IdentityService } from '@/services/identity-service'
import { Button } from '@/components/ui/button'
import type { OpportunityType } from '@/types'
import Link from 'next/link'

const OPPORTUNITY_TYPES: { label: string; value: OpportunityType | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Jobs', value: 'job' },
  { label: 'Internships', value: 'internship' },
  { label: 'Scholarships', value: 'scholarship' },
  { label: 'Volunteering', value: 'volunteer' },
  { label: 'Events', value: 'event' },
]

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; tab?: string }>
}) {
  const params = await searchParams
  const type = params.type as OpportunityType | undefined
  const tab = params.tab === 'for-you' ? 'for-you' : 'browse'
  const currentUser = await IdentityService.getCurrentUser()

  const [allOpportunities, personalizedOpportunities] = await Promise.all([
    type
      ? OpportunityService.getOpportunities({ type })
      : OpportunityService.getOpportunities(),
    currentUser
      ? OpportunityService.getPersonalizedOpportunities(currentUser.id, { limit: 20 })
      : Promise.resolve([]),
  ]).catch(() => [[], []])

  const displayOpportunities = tab === 'for-you' ? personalizedOpportunities : allOpportunities

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
                Opportunities
              </h1>
              <p className="text-neutral-600 mt-2">
                Discover internships, jobs, scholarships, and more tailored for you.
              </p>
            </div>
            <Link href="/opportunities/applications">
              <Button variant="secondary" className="rounded-full font-bold">
                My Applications
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6 md:mb-8 flex flex-wrap gap-2">
          <Link
            href="/opportunities?tab=for-you"
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              tab === 'for-you'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
            }`}
          >
            For You
          </Link>
          <Link
            href="/opportunities"
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              tab === 'browse' || !tab
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
            }`}
          >
            Browse All
          </Link>
          {OPPORTUNITY_TYPES.filter(t => t.value).map((t) => (
            <Link
              key={t.label}
              href={tab === 'for-you' ? `/opportunities?tab=for-you&type=${t.value}` : `/opportunities?type=${t.value}`}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                type === t.value
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {displayOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayOpportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-base md:text-lg">
              {tab === 'for-you' ? 'No personalized opportunities yet. Complete your profile to get matches.' : 'No opportunities available yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}