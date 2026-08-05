import { createClient } from '@/lib/supabase/server'

export default async function AmbassadorsReportsPage() {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('ambassador_reports')
    .select(`
      *,
      ambassador:ambassadors(
        profile:profiles(full_name)
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Reports
          </h1>

        </div>

        {reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-neutral-900">Report</span>
                  <span className="text-xs text-neutral-400">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-neutral-600 mb-2">{report.content || report.summary || 'No content'}</p>
                <p className="text-xs text-neutral-400">
                  By {report.ambassador?.profile?.full_name || 'Ambassador'}
                </p>
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
