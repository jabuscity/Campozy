import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TipService } from '@/services/tip-service'

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

  const isAdmin = userRoles?.some((ur: { roles: { name: string }[] }) =>
    ur.roles.some(r => ['admin', 'moderator'].includes(r.name))
  ) ?? false

  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  const suggestions = await TipService.getPendingSuggestions()

  return NextResponse.json({ suggestions })
}
