import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface SearchResult {
  type: 'property' | 'university' | 'campus' | 'neighborhood' | 'discussion' | 'opportunity' | 'tip' | 'event'
  id: string
  title: string
  description: string
  href: string
  icon: string
}

interface PropertyRow {
  id: string
  name: string
  description: string | null
}

interface UniversityRow {
  id: string
  name: string
  description: string | null
}

interface CampusRow {
  id: string
  name: string
  description: string | null
}

interface NeighborhoodRow {
  id: string
  name: string
  description: string | null
}

interface DiscussionRow {
  id: string
  title: string
  content: string | null
}

interface OpportunityRow {
  id: string
  title: string
  description: string | null
}

interface TipRow {
  id: string
  title: string
  description: string | null
}

interface EventRow {
  id: string
  title: string
  description: string | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''

  if (!q.trim()) {
    return NextResponse.json({ results: [] as SearchResult[], query: '' })
  }

  const supabase = await createClient()
  const escaped = q.trim().replace(/[%_]/g, '\\$&')

  const [
    propertiesRes,
    universitiesRes,
    campusesRes,
    neighborhoodsRes,
    discussionsRes,
    opportunitiesRes,
    tipsRes,
    eventsRes,
  ] = await Promise.all([
    supabase.from('properties').select('id, name, description').ilike('name', `%${escaped}%`).limit(5),
    supabase.from('universities').select('id, name, description').ilike('name', `%${escaped}%`).limit(5),
    supabase.from('campuses').select('id, name, description').ilike('name', `%${escaped}%`).limit(5),
    supabase.from('neighborhoods').select('id, name, description').ilike('name', `%${escaped}%`).limit(5),
    supabase.from('discussions').select('id, title, content').or(`title.ilike.%${escaped}%,content.ilike.%${escaped}%`).limit(5),
    supabase.from('opportunities').select('id, title, description').or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`).limit(5),
    supabase.from('tips').select('id, title, description').or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`).limit(5),
    supabase.from('events').select('id, title, description').or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`).limit(5),
  ])

  const results: SearchResult[] = [
    ...(propertiesRes.data || []).map((item: PropertyRow) => ({
      type: 'property' as const,
      id: item.id,
      title: item.name,
      description: item.description || '',
      href: `/property/${item.id}`,
      icon: '🏠',
    })),
    ...(universitiesRes.data || []).map((item: UniversityRow) => ({
      type: 'university' as const,
      id: item.id,
      title: item.name,
      description: item.description || '',
      href: `/universities/${item.id}`,
      icon: '🎓',
    })),
    ...(campusesRes.data || []).map((item: CampusRow) => ({
      type: 'campus' as const,
      id: item.id,
      title: item.name,
      description: item.description || '',
      href: `/campuses/${item.id}`,
      icon: '🏫',
    })),
    ...(neighborhoodsRes.data || []).map((item: NeighborhoodRow) => ({
      type: 'neighborhood' as const,
      id: item.id,
      title: item.name,
      description: item.description || '',
      href: `/neighborhoods/${item.id}`,
      icon: '📍',
    })),
    ...(discussionsRes.data || []).map((item: DiscussionRow) => ({
      type: 'discussion' as const,
      id: item.id,
      title: item.title,
      description: item.content || '',
      href: `/community?discussion=${item.id}`,
      icon: '💬',
    })),
    ...(opportunitiesRes.data || []).map((item: OpportunityRow) => ({
      type: 'opportunity' as const,
      id: item.id,
      title: item.title,
      description: item.description || '',
      href: `/opportunities/${item.id}`,
      icon: '💼',
    })),
    ...(tipsRes.data || []).map((item: TipRow) => ({
      type: 'tip' as const,
      id: item.id,
      title: item.title,
      description: item.description || '',
      href: `/tips`,
      icon: '💡',
    })),
    ...(eventsRes.data || []).map((item: EventRow) => ({
      type: 'event' as const,
      id: item.id,
      title: item.title,
      description: item.description || '',
      href: `/community/events`,
      icon: '📅',
    })),
  ]

  return NextResponse.json({ results, query: q.trim() })
}
