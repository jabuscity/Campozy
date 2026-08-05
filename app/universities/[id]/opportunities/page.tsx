import { OpportunityService } from '@/services/opportunity-service'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function UniversityOpportunitiesPage() {
  const opportunities = await OpportunityService.getOpportunities({ limit: 20 })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Opportunities
          </h1>

        </div>

        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href={`/opportunities/${opportunity.id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:border-primary transition-all"
              >
                <h3 className="font-bold text-neutral-900 mb-1">{opportunity.title}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{opportunity.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{opportunity.employer?.name}</span>
                  <span className="font-medium text-primary capitalize">{opportunity.type?.replace('_', ' ')}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">Nothing here yet.</p>
            <Link href="/opportunities" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Browse all opportunities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
