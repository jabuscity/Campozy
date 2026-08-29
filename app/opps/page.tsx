import { createClient } from '@/lib/supabase/server'
import { OpportunityService } from '@/services/opportunity-service'
import { OpportunitySuggestionService } from '@/services/opportunity-suggestion-service'
import { OppsClient } from './opps-client'

export default async function OppsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const opportunities = await OpportunityService.getOpportunities()

  let opportunityPendingSuggestions: Awaited<ReturnType<typeof OpportunitySuggestionService.getUserPendingSuggestions>> = []
  let isAdmin = false

  if (user) {
    opportunityPendingSuggestions = await OpportunitySuggestionService.getUserPendingSuggestions(user.id)

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
    <OppsClient
      opportunities={opportunities}
      opportunityPendingSuggestions={opportunityPendingSuggestions}
      isAdmin={isAdmin}
      userId={user?.id || null}
    />
  )
}
