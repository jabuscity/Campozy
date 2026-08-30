import { createClient } from '@/lib/supabase/server'
import type { CampusIntelligenceReport } from '@/types'

export default async function UniversityReportsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('campus_intelligence_reports')
    .select('*')
    .eq('campus_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
            Reports
          </h1>

        </div>

        {reports && reports.length > 0 ? (
          <div className="space-y-6">
            {reports.map((report: CampusIntelligenceReport) => (
              <div key={report.id} className="bg-white rounded-3xl border border-neutral-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Campus Report</h3>
                    <p className="text-sm text-neutral-500">
                      {new Date(report.period_start).toLocaleDateString()} — {new Date(report.period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-500 mb-1">Active Properties</p>
                    <p className="text-2xl font-black text-neutral-900">{report.active_properties}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-500 mb-1">Avg Score</p>
                    <p className="text-2xl font-black text-neutral-900">{report.avg_campozy_score ?? '—'}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-500 mb-1">Reviews</p>
                    <p className="text-2xl font-black text-neutral-900">{report.review_count}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-2xl p-4">
                    <p className="text-sm text-neutral-500 mb-1">Contributors</p>
                    <p className="text-2xl font-black text-neutral-900">{report.contributor_count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">None yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
