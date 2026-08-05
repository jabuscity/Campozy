import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TipService } from '@/services/tip-service'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params
  const body = await request.json()
  const { action, rejectionReason } = body

  if (action === 'approve') {
    const result = await TipService.approveSuggestion(id, user.id)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  if (action === 'reject') {
    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required.' }, { status: 400 })
    }
    const result = await TipService.rejectSuggestion(id, user.id, rejectionReason)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}
