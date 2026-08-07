import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { FeedService } from '@/services/feed-service'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error('getUser error:', userError)
  }

  const posts = await FeedService.getPosts(user?.id || null).catch((e) => {
    console.error('getPosts error:', e)
    return []
  })

  return NextResponse.json({ posts, userId: user?.id || null, userError: userError?.message || null })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const body = await request.json()
  const { title, content, imageUrl } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 })
  }

  const result = await FeedService.createPost(user.id, title, content, imageUrl || null)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
