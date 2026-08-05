import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      full_name,
      date_of_birth,
      campus_id,
      former_school_id,
      program_id,
      enrollment_year,
      personality,
      fun_activities,
      religious_inclination,
      study_type,
      username,
      email,
      password,
    } = body as Record<string, unknown>

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: email as string,
      password: password as string,
      options: {
        data: {
          full_name: (full_name as string) || '',
          username: (username as string) || '',
          role: 'student',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || 'Sign up failed' }, { status: 400 })
    }

    const userId = data.user.id

    if (typeof former_school_id === 'string' && former_school_id) {
      await supabase
        .from('high_schools')
        .upsert({ name: former_school_id }, { onConflict: 'name' })
    }

    const profileUpdate: Record<string, unknown> = {
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    }
    if (typeof full_name === 'string' && full_name.trim()) profileUpdate.full_name = full_name.trim()
    if (typeof username === 'string' && username.trim()) profileUpdate.username = username.trim()
    if (typeof email === 'string' && email.trim()) profileUpdate.email = email.trim()
    if (typeof date_of_birth === 'string' && date_of_birth) profileUpdate.date_of_birth = date_of_birth
    if (typeof campus_id === 'string' && campus_id) profileUpdate.campus_id = campus_id
    if (typeof former_school_id === 'string' && former_school_id) profileUpdate.former_school_id = former_school_id

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    const studentUpdate: Record<string, unknown> = {}
    if (typeof program_id === 'string' && program_id) studentUpdate.program_id = program_id
    if (typeof personality === 'string') studentUpdate.personality = personality
    if (typeof fun_activities === 'string') studentUpdate.fun_activities = fun_activities
    if (typeof religious_inclination === 'string') studentUpdate.religious_inclination = religious_inclination
    if (typeof study_type === 'string') studentUpdate.study_type = study_type
    if (typeof enrollment_year === 'number' && enrollment_year != null) studentUpdate.enrollment_year = enrollment_year

    if (Object.keys(studentUpdate).length > 0) {
      const { error: studentError } = await supabase
        .from('students')
        .update(studentUpdate)
        .eq('id', userId)

      if (studentError) {
        return NextResponse.json({ error: studentError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, userId })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
