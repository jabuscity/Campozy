import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CommunityService } from '@/services/community-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const discussion = await CommunityService.getDiscussionById(id, user?.id || undefined)
    const replies = await CommunityService.getReplies(id)
    return NextResponse.json({ discussion, replies })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to load discussion' }, { status: 500 })
  }
}
