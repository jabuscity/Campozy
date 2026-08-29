import { createClient } from '@/lib/supabase/server'
import { TipService } from '@/services/tip-service'
import { TipsView } from '@/components/tips/tips-view'

export default async function TipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const categories = await TipService.getCategories()
  const approvedTips = await TipService.getApprovedTips()

  let pendingSuggestions: typeof approvedTips = []
  let isAdmin = false

  if (user) {
    pendingSuggestions = await TipService.getUserPendingSuggestions(user.id)

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)

    isAdmin = userRoles?.some((ur: { roles: { name: string }[] | { name: string } | null }) => {
      if (Array.isArray(ur.roles)) {
        return ur.roles.some((r: { name: string }) => ['admin', 'moderator'].includes(r.name))
      }
      return ur.roles !== null && ur.roles !== undefined && ['admin', 'moderator'].includes(ur.roles.name)
    }) ?? false
  }

  return (
    <div className="bg-white min-h-screen">
      <TipsView
        categories={categories}
        approvedTips={approvedTips}
        pendingSuggestions={pendingSuggestions}
        isAdmin={isAdmin}
        userId={user?.id || null}
      />
    </div>
  )
}
