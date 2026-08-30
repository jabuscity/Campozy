import { OpportunityService } from '@/services/opportunity-service'
import Link from 'next/link'
import { MapPin, ArrowLeft, ExternalLink, Clock } from 'lucide-react'

export default async function OpportunityPage({ params }: { params: { id: string } }) {
  const opportunity = await OpportunityService.getOpportunityById(params.id)

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Opportunity not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/opportunities" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to opportunities
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase">
                {opportunity.title}
              </h1>
              <p className="mt-2 text-neutral-500 text-lg">
                {opportunity.employer?.name || 'Direct Application'}
              </p>
            </div>
            {opportunity.application_url && (
              <a
                href={opportunity.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 bg-transparent px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-all"
              >
                Apply <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                Description
              </h2>
              <p className="text-neutral-500 leading-relaxed whitespace-pre-wrap">
                {opportunity.description}
              </p>
            </section>

            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <section className="bg-white rounded-3xl border border-neutral-200 p-8">
                <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {opportunity.requirements.map((req: unknown, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {typeof req === 'string' ? req : JSON.stringify(req)}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h3 className="text-lg font-black text-neutral-900 mb-4 uppercase tracking-tight">
                Details
              </h3>
              <div className="space-y-3">
                {opportunity.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">{opportunity.location}</span>
                  </div>
                )}
                {opportunity.is_remote && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-500 w-32">Remote:</span>
                    <span className="text-neutral-700">Yes</span>
                  </div>
                )}
                {opportunity.compensation && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-500 w-32">Compensation:</span>
                    <span className="text-neutral-700">{opportunity.compensation}</span>
                  </div>
                )}
                {opportunity.deadline && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
