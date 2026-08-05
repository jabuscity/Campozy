import { createClient } from '@/lib/supabase/server'

export default async function ScoutsAssignmentsPage() {
  const supabase = await createClient()
  const { data: assignments } = await supabase
    .from('scout_assignments')
    .select(`
      *,
      scout:scouts(
        profile:profiles(full_name),
        certification_level
      ),
      properties(name, neighborhoods(name))
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Assignments
          </h1>

        </div>

        {assignments && assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                      assignment.status === 'completed'
                        ? 'bg-green-50 text-green-600'
                        : assignment.status === 'in_progress'
                        ? 'bg-primary/10 text-primary'
                        : assignment.status === 'cancelled'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {assignment.status}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                      assignment.priority === 'urgent'
                        ? 'bg-red-50 text-red-600'
                        : assignment.priority === 'high'
                        ? 'bg-secondary/10 text-secondary'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {assignment.priority}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {assignment.due_date ? `Due ${new Date(assignment.due_date).toLocaleDateString()}` : 'No deadline'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{assignment.properties?.name}</p>
                    <p className="text-sm text-neutral-500">{assignment.properties?.neighborhood?.name}</p>
                    <p className="text-xs text-neutral-400 mt-1">{assignment.assignment_type}</p>
                  </div>
                  <div className="text-right text-sm text-neutral-500">
                    <p>{assignment.scout?.profile?.full_name || 'Unassigned'}</p>
                    <p className="text-xs">{assignment.scout?.certification_level}</p>
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
