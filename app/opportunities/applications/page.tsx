import { OpportunityService } from '@/services/opportunity-service'
import { IdentityService } from '@/services/identity-service'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { OpportunityApplication, Opportunity } from '@/types'

export default async function ApplicationsPage() {
  const currentUser = await IdentityService.getCurrentUser()
  let applications: (OpportunityApplication & { opportunity: Opportunity })[] = []

  if (currentUser) {
    applications = await OpportunityService.getStudentApplications(currentUser.id)
  }

  const statusColors: Record<string, string> = {
    applied: 'bg-primary/10 text-primary',
    reviewed: 'bg-secondary/10 text-secondary',
    shortlisted: 'bg-warning/10 text-warning',
    accepted: 'bg-success/10 text-success',
    rejected: 'bg-danger/10 text-danger',
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <Link href="/opportunities" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Opportunities
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase">
            My Applications
          </h1>
          <p className="text-neutral-600 mt-2">
            Track your opportunity applications and their status.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-white rounded-3xl border border-neutral-200">
            <RefreshCw className="h-10 md:h-12 w-10 md:w-12 text-neutral-300 mx-auto mb-3 md:mb-4" />
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-2">No Applications Yet</h2>
            <p className="text-neutral-600 mb-4 md:mb-6 text-sm md:text-base">
              Start applying to opportunities and track them here.
            </p>
            <Link href="/opportunities">
              <Button className="rounded-full font-bold">Browse Opportunities</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-neutral-900">
                        {application.opportunity?.title || 'Opportunity'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[application.status] || 'bg-neutral-100 text-neutral-600'}`}>
                        {application.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-2">
                      {application.opportunity?.employer?.name || 'Unknown employer'}
                    </p>
                    <p className="text-xs text-neutral-400">
                      Applied on {new Date(application.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {application.opportunity?.application_url && (
                      <a href={application.opportunity.application_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="font-bold">
                          <ExternalLink className="h-4 w-4 mr-2" /> View
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
