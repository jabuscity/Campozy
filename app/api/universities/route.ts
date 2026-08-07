import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('universities')
    .select('name')
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch universities:', error)
    return NextResponse.json({ universities: [] })
  }

  return NextResponse.json({ universities: (data || []).map((u: { name: string }) => u.name) })
}
