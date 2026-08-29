import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { OpportunityService } from '@/services/opportunity-service'
import { OpportunitySuggestionService } from '@/services/opportunity-suggestion-service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const opportunities = await OpportunityService.getOpportunities()

  let userPending: Awaited<ReturnType<typeof OpportunitySuggestionService.getUserPendingSuggestions>> = []
  if (user) {
    userPending = await OpportunitySuggestionService.getUserPendingSuggestions(user.id)
  }

  return NextResponse.json({ opportunities, pendingSuggestions: userPending })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const body = await request.json()
  const { type, title, description, link, location, isRemote, compensation, requirements, deadline } = body

  if (!type || !title || !description) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const result = await OpportunitySuggestionService.createSuggestion(
    user.id,
    type,
    title,
    description,
    link,
    location || null,
    Boolean(isRemote),
    compensation || null,
    Array.isArray(requirements) ? requirements : [],
    deadline || null
  )

  if (result.error) {
    console.error('Opportunity suggestion error:', result.error)
    return NextResponse.json({ error: 'Failed to submit suggestion.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
