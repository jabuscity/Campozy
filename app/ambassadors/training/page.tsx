import { createClient } from '@/lib/supabase/server'

export default async function AmbassadorsTrainingPage() {
  const supabase = await createClient()
  const { data: ambassadors } = await supabase
    .from('ambassadors')
    .select(`
      *,
      profile:profiles(id, full_name, avatar_url),
      program:ambassador_programs(name)
    `)
    .order('started_at', { ascending: false })

  const trainingModules = [
    { id: '1', title: 'Campus Verification Fundamentals', duration: '15 min', status: 'required' },
    { id: '2', title: 'Community Engagement Best Practices', duration: '20 min', status: 'required' },
    { id: '3', title: 'Trust Signal Reporting', duration: '10 min', status: 'optional' },
    { id: '4', title: 'Growth Mission Planning', duration: '25 min', status: 'required' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
            Training
          </h1>

        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">Training Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingModules.map((module) => (
              <div key={module.id} className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-neutral-900">{module.title}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    module.status === 'required'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {module.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">{module.duration}</p>
                <button className="mt-4 w-full h-10 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all">
                  Start Module
                </button>
              </div>
            ))}
          </div>
        </div>

        {ambassadors && ambassadors.length > 0 ? (
          <div>
            <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">Active Ambassadors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ambassadors.map((ambassador) => (
                <div key={ambassador.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                      {ambassador.profile?.full_name?.[0] || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{ambassador.profile?.full_name}</p>
                      <p className="text-xs text-neutral-500 uppercase tracking-tight">{ambassador.program?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <span className="capitalize">{ambassador.status}</span>
                    <span>•</span>
                    <span>{new Date(ambassador.started_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500">None yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
