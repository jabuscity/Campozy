import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { tipIds, userId } = body

  if (!tipIds || !Array.isArray(tipIds) || tipIds.length === 0) {
    return NextResponse.json({ votes: [] })
  }

  const { data: votes } = await supabase
    .from('tip_votes')
    .select('tip_id, vote_type')
    .in('tip_id', tipIds)

  const aggregated: Record<string, { upvotes: number; downvotes: number }> = {}
  for (const v of (votes || []) as { tip_id: string; vote_type: number }[]) {
    if (!aggregated[v.tip_id]) {
      aggregated[v.tip_id] = { upvotes: 0, downvotes: 0 }
    }
    if (v.vote_type === 1) aggregated[v.tip_id].upvotes += 1
    else aggregated[v.tip_id].downvotes += 1
  }

  const userVoteMap: Record<string, number> = {}
  if (userId) {
    const { data: userVotes } = await supabase
      .from('tip_votes')
      .select('tip_id, vote_type')
      .eq('user_id', userId)
      .in('tip_id', tipIds)

    for (const v of (userVotes || []) as { tip_id: string; vote_type: number }[]) {
      userVoteMap[v.tip_id] = v.vote_type
    }
  }

  const result = tipIds.map((tipId: string) => ({
    tip_id: tipId,
    upvotes: aggregated[tipId]?.upvotes || 0,
    downvotes: aggregated[tipId]?.downvotes || 0,
    user_vote: userVoteMap[tipId] || null,
  }))

  return NextResponse.json({ votes: result })
}
