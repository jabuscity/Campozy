import { createClient } from '@/lib/supabase/server'

export default async function AmbassadorsRecognitionPage() {
  const supabase = await createClient()
  const { data: rewards } = await supabase
    .from('ambassador_rewards')
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
            Recognition
          </h1>

        </div>

        {rewards && rewards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="text-lg">🏆</span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{reward.title || 'Recognition'}</p>
                    <p className="text-xs text-neutral-500">{reward.reward_type || 'Award'}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-2">{reward.description || ''}</p>
                <p className="text-xs text-neutral-400">
                  {reward.ambassador?.profile?.full_name || 'Ambassador'} • {new Date(reward.created_at).toLocaleDateString()}
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
