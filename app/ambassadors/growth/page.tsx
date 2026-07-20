import { createClient } from '@/lib/supabase/server'

export default async function AmbassadorsGrowthPage() {
  const supabase = await createClient()
  const { data: assignments } = await supabase
    .from('ambassador_assignments')
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
            Growth Missions
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Track assignment progress and mission completion
          </p>
        </div>

        {assignments && assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-neutral-900">{assignment.task_type}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                    assignment.status === 'completed'
                      ? 'bg-green-50 text-green-600'
                      : assignment.status === 'in_progress'
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
                {assignment.description && (
                  <p className="text-sm text-neutral-600 mb-2">{assignment.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{assignment.ambassador?.profile?.full_name || 'Ambassador'}</span>
                  <span>{new Date(assignment.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No growth missions assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
