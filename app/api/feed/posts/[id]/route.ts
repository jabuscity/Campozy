import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { FeedService } from '@/services/feed-service'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { id } = await params

  const [post, comments] = await Promise.all([
    FeedService.getPostById(id, user?.id || null),
    FeedService.getComments(id),
  ])

  if (!post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  return NextResponse.json({ post, comments })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const { id } = await params

  const result = await FeedService.deletePost(id, user.id)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
