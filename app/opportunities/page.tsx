import { OpportunityService } from '@/services/opportunity-service'
import { OpportunityCard } from '@/components/opportunity-card'
import type { OpportunityType } from '@/types'
import Link from 'next/link'

const OPPORTUNITY_TYPES: { label: string; value: OpportunityType | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Internships', value: 'internship' },
  { label: 'Scholarships', value: 'scholarship' },
  { label: 'Mentorship', value: 'mentorship' },
  { label: 'Graduate Programs', value: 'graduate_trainee' },
  { label: 'Competitions', value: 'competition' },
]

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const type = searchParams.type as OpportunityType | undefined
  const opportunities = type
    ? await OpportunityService.getOpportunities({ type })
    : await OpportunityService.getOpportunities()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Opportunities
          </h1>
          <p className="mt-2 text-neutral-500 text-base md:text-lg">
            Internships, scholarships, mentorships, and jobs for students.
          </p>
        </div>

        <div className="mb-6 md:mb-8 flex flex-wrap gap-2">
          {OPPORTUNITY_TYPES.map((t) => (
            <Link
              key={t.label}
              href={t.value ? `/opportunities?type=${t.value}` : '/opportunities'}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                type === t.value || (!type && !t.value)
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-base md:text-lg">No opportunities posted yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
