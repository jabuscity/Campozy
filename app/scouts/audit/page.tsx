import { createClient } from '@/lib/supabase/server'

export default async function ScoutsAuditPage() {
  const supabase = await createClient()
  const { data: audits } = await supabase
    .from('scout_audits')
    .select(`
      *,
      scout:scouts(
        profile:profiles(full_name)
      ),
      auditor:profiles!scout_audits_auditor_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Audit History
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Scout report quality audits and accuracy tracking
          </p>
        </div>

        {audits && audits.length > 0 ? (
          <div className="space-y-4">
            {audits.map((audit) => (
              <div key={audit.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                    audit.outcome === 'accurate'
                      ? 'bg-green-50 text-green-600'
                      : audit.outcome === 'partially_accurate'
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {audit.outcome.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-neutral-400">{new Date(audit.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-neutral-600">Scout: <span className="font-medium text-neutral-900">{audit.scout?.profile?.full_name || 'Unknown'}</span></p>
                    <p className="text-neutral-600">Auditor: <span className="font-medium text-neutral-900">{audit.auditor?.full_name || 'Unknown'}</span></p>
                  </div>
                </div>
                {audit.notes && (
                  <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{audit.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No audit records yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
