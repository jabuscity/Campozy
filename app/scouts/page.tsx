import { createClient } from '@/lib/supabase/server'
import { Shield, Users } from 'lucide-react'

export default async function ScoutsPage() {
  const supabase = await createClient()
  const { data: scouts } = await supabase
    .from('scouts')
    .select(`
      *,
      profile:profiles(id, full_name, avatar_url)
    `)
    .eq('is_active', true)
    .order('reputation_score', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Scouts
          </h1>
          <p className="mt-2 text-neutral-500 text-base md:text-lg">
            Verification scouts ensuring trust and accuracy across Campozy.
          </p>
        </div>

        {scouts && scouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {scouts.map((scout) => (
              <div
                key={scout.id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                    {scout.profile?.full_name?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">
                      {scout.profile?.full_name || 'Scout'}
                    </p>
                    <p className="text-xs text-neutral-500 uppercase tracking-tight">
                      {scout.certification_level}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-secondary" />
                    <span>Reputation: {scout.reputation_score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-secondary" />
                    <span>{scout.total_verifications} verifications</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-neutral-200">
            <Users className="h-10 md:h-12 w-10 md:w-12 text-neutral-300 mx-auto mb-3 md:mb-4" />
            <p className="text-neutral-500 text-base md:text-lg">No scouts yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
