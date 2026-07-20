import { createClient } from '@/lib/supabase/server'
import { Users, Shield } from 'lucide-react'

export default async function ParentsPage() {
  const supabase = await createClient()
  const { data: parents } = await supabase
    .from('parent_profiles')
    .select(`
      *,
      profile:profiles(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Parents
          </h1>
          <p className="mt-2 text-neutral-500 text-base md:text-lg">
            Parent engagement, verification signals, and housing confidence.
          </p>
        </div>

        {parents && parents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {parents.map((parent) => (
              <div
                key={parent.id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black">
                    {parent.profile?.full_name?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">
                      {parent.profile?.full_name || 'Parent'}
                    </p>
                    <p className="text-xs text-neutral-500 uppercase tracking-tight">
                      {parent.relationship}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Shield className="h-4 w-4 text-secondary" />
                  <span>Verified Parent</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-neutral-200">
            <Users className="h-10 md:h-12 w-10 md:w-12 text-neutral-300 mx-auto mb-3 md:mb-4" />
            <p className="text-neutral-500 text-base md:text-lg">No parents registered yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
