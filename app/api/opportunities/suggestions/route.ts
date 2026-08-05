import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { OpportunitySuggestionService } from '@/services/opportunity-suggestion-service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)

  const isAdmin = userRoles?.some((ur: { roles: { name: string }[] | { name: string } | null }) => {
    if (Array.isArray(ur.roles)) {
      return ur.roles.some((r: { name: string }) => ['admin', 'moderator'].includes(r.name))
    }
    return ur.roles !== null && ur.roles !== undefined && ['admin', 'moderator'].includes(ur.roles.name)
  }) ?? false

  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const suggestions = await OpportunitySuggestionService.getPendingSuggestions()

  return NextResponse.json({ suggestions })
}
