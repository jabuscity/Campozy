'use client'

import * as React from 'react'
import { OpportunitiesView } from '@/components/opportunities/opportunities-view'
import { Opportunity } from '@/types'
import { OpportunitySuggestion } from '@/services/opportunity-suggestion-service'

interface OppsClientProps {
  opportunities: Opportunity[]
  opportunityPendingSuggestions: OpportunitySuggestion[]
  isAdmin: boolean
  userId: string | null
}

export function OppsClient({
  opportunities,
  opportunityPendingSuggestions,
  isAdmin,
  userId,
}: OppsClientProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="hidden md:block bg-white border-b border-neutral-200 py-6">
        <div className="px-4 sm:px-6">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">Opportunities</h1>
          <p className="text-neutral-600 mt-1 text-sm">
            Discover internships, jobs, scholarships, and more.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-8 pb-8">
        <OpportunitiesView
          opportunities={opportunities}
          pendingSuggestions={opportunityPendingSuggestions}
          isAdmin={isAdmin}
          userId={userId}
          variant="embedded"
        />
      </div>
    </div>
  )
}
