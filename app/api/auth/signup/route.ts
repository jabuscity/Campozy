import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string | null)?.trim() || ''
  const formerSchool = (formData.get('formerSchool') as string | null)?.trim() || ''

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'student',
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message || 'Signup failed' }, { status: 400 })
  }

  const userId = data.user.id

  if (formerSchool) {
    const { data: schoolData, error: schoolError } = await supabase
      .from('high_schools')
      .upsert(
        { name: formerSchool },
        { onConflict: 'name' }
      )
      .select('id')
      .single()

    if (!schoolError && schoolData) {
      await supabase
        .from('profiles')
        .update({ former_school_id: schoolData.id })
        .eq('id', userId)
    }
  }

  await supabase.from('students').insert({
    id: userId,
    enrollment_year: null,
    expected_graduation_year: null,
  }).select('id').maybeSingle()

  await supabase
    .from('profiles')
    .update({ is_onboarded: false })
    .eq('id', userId)

  return NextResponse.json({ success: true })
}
