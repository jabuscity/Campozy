import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { error } = await supabase
    .from('students')
    .update({
      enrollment_year: body.enrollment_year,
      expected_graduation_year: body.expected_graduation_year,
      campus_id: body.campus_id,
      program_id: body.program_id,
      former_school_id: body.former_school_id,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Student profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
