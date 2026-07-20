import Link from 'next/link'
import { Opportunity } from '@/types'

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Link href={`/opportunities/${opportunity.id}`} className="block">
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6 hover:shadow-lg transition-all h-full">
        <h3 className="text-lg font-black text-neutral-900 mb-2">{opportunity.title}</h3>
        <p className="text-sm text-neutral-500 line-clamp-2">
          {opportunity.employer?.name || 'Direct Application'}
        </p>
      </div>
    </Link>
  )
}
