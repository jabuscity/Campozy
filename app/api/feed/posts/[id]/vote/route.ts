import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { FeedService } from '@/services/feed-service'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { voteType } = body

  if (voteType !== 1 && voteType !== -1) {
    return NextResponse.json({ error: 'Invalid vote type.' }, { status: 400 })
  }

  const result = await FeedService.vote(id, user.id, voteType)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
