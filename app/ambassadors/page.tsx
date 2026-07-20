import { createClient } from '@/lib/supabase/server'
import { Shield, Users } from 'lucide-react'

export default async function AmbassadorsPage() {
  const supabase = await createClient()
  const { data: ambassadors } = await supabase
    .from('ambassadors')
    .select(`
      *,
      profile:profiles(id, full_name, avatar_url),
      program:ambassador_programs(id, name)
    `)
    .order('started_at', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Ambassadors
          </h1>
          <p className="mt-2 text-neutral-500 text-base md:text-lg">
            Campus ambassadors driving growth and community programs.
          </p>
        </div>

        {ambassadors && ambassadors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {ambassadors.map((ambassador) => (
              <div
                key={ambassador.id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                    {ambassador.profile?.full_name?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">
                      {ambassador.profile?.full_name || 'Ambassador'}
                    </p>
                    <p className="text-xs text-neutral-500 uppercase tracking-tight">
                      {ambassador.program?.name || 'General Program'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Shield className="h-4 w-4 text-secondary" />
                  <span className="capitalize">{ambassador.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-neutral-200">
            <Users className="h-10 md:h-12 w-10 md:w-12 text-neutral-300 mx-auto mb-3 md:mb-4" />
            <p className="text-neutral-500 text-base md:text-lg">No ambassadors yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
