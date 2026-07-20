import { OpportunityService } from '@/services/opportunity-service'
import { OpportunityCard } from '@/components/opportunity-card'

export default async function OpportunitiesPage() {
  const opportunities = await OpportunityService.getOpportunities()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Opportunities
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Internships, scholarships, mentorships, and jobs for students.
          </p>
        </div>

        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No opportunities posted yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
