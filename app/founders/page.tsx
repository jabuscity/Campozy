import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, ShieldCheck, Trophy } from 'lucide-react'

export default async function FoundersPage() {
  const supabase = await createClient()
  const { data: memberships } = await supabase
    .from('founder_memberships')
    .select(`
      *,
      profile:profiles(id, username, full_name, avatar_url, campozy_score),
      cohort:founder_cohorts(id, name, scope)
    `)
    .order('became_founder_at', { ascending: false })

  const { data: events } = await supabase
    .from('founder_qualification_events')
    .select(`
      *,
      profile:profiles(id, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Founders
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Campus, country, and global pioneers building Campozy.
          </p>
        </div>

            {memberships && memberships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memberships.map((membership) => (
              <div
                key={membership.id}
                className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                    {membership.profile?.full_name?.[0] || 'F'}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">
                      {membership.profile?.full_name || 'Founder'}
                    </p>
                    <p className="text-xs text-neutral-500 uppercase tracking-tight">
                      {membership.cohort?.scope || 'Campus'} Founder
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  <span>Contribution Score: {membership.contribution_score}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">No founders yet. Be the first.</p>
            <Link href="/signup" className="mt-6 inline-flex">
              <Button size="lg" className="px-10 h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                Join Network
              </Button>
            </Link>
          </div>
        )}

        {events && events.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
              Recent Achievements
            </h2>
            <div className="bg-white rounded-3xl border border-neutral-200 divide-y divide-neutral-100">
              {events.map((event) => (
                <div key={event.id} className="p-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-900 text-sm">
                      {event.profile?.full_name || 'Founder'}
                    </p>
                    <p className="text-sm text-neutral-500 line-clamp-1">{event.description}</p>
                  </div>
                  <div className="text-sm font-bold text-secondary shrink-0">
                    +{event.points} pts
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
