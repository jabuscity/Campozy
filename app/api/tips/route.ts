import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TipService } from '@/services/tip-service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const approved = await TipService.getApprovedTips()

  let userPending: typeof approved = []
  if (user) {
    userPending = await TipService.getUserPendingSuggestions(user.id)
  }

  return NextResponse.json({ approvedTips: approved, pendingSuggestions: userPending })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const body = await request.json()
  const { categoryId, title, description } = body

  if (!categoryId || !title || !description) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const result = await TipService.createSuggestion(user.id, categoryId, title, description)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
