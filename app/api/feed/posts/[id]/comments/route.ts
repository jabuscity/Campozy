import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { FeedService } from '@/services/feed-service'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const comments = await FeedService.getComments(id)
  return NextResponse.json({ comments })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { content } = body

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
  }

  const result = await FeedService.addComment(id, user.id, content.trim())

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
