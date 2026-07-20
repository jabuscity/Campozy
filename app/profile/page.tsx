import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileDashboard } from '@/components/profile/profile-dashboard'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles(*, roles(*)),
      students(*),
      owner:owners(*),
      alumni_profiles(*),
      founder_memberships(*, cohort:founder_cohorts(*))
    `)
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <ProfileDashboard profile={profile} userId={user.id} />
      </div>
    </div>
  )
}
