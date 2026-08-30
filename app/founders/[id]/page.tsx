import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

export default async function FounderPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: membership } = await supabase
    .from('founder_memberships')
    .select(`
      *,
      profile:profiles(id, username, full_name, avatar_url, bio, trust_level),
      cohort:founder_cohorts(id, name, scope, max_members)
    `)
    .eq('id', params.id)
    .single()

  if (!membership) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Founder not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/founders" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to founders
          </Link>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shrink-0">
              {membership.profile?.full_name?.[0] || 'F'}
            </div>
            <div>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase">
                {membership.profile?.full_name || 'Founder'}
              </h1>
              <p className="mt-2 text-neutral-500 text-lg">
                {membership.cohort?.scope || 'Campus'} Founder • {membership.cohort?.name || 'General'}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <span>Contribution Score: {membership.contribution_score}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                About
              </h2>
              <p className="text-neutral-500 leading-relaxed">
                {membership.profile?.bio || 'No bio available.'}
              </p>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h3 className="text-lg font-black text-neutral-900 mb-4 uppercase tracking-tight">
                Quick Facts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-neutral-500 w-32">Scope:</span>
                  <span className="text-neutral-700 capitalize">{membership.cohort?.scope || 'Campus'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-neutral-500 w-32">Cohort:</span>
                  <span className="text-neutral-700">{membership.cohort?.name || 'General'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-neutral-500 w-32">Score:</span>
                  <span className="text-neutral-700">{membership.contribution_score}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-neutral-500 w-32">Joined:</span>
                  <span className="text-neutral-700">
                    {new Date(membership.became_founder_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
