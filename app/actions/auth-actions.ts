'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=invalid')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string | null)?.trim() || ''
  const formerSchool = (formData.get('formerSchool') as string | null)?.trim() || ''

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
    redirect('/signup?error=create_failed')
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

  revalidatePath('/', 'layout')
  redirect('/login?verified=1')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function forgotPassword(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  return {}
}

export async function resetPassword(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()

  const password = formData.get('password') as string

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Failed to reset password.' }
  }

  revalidatePath('/', 'layout')
  redirect('/login?reset=success')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const fullName = (formData.get('fullName') as string | null)?.trim() || null
  const username = (formData.get('username') as string | null)?.trim() || null
  const bio = (formData.get('bio') as string | null)?.trim() || null
  const phoneNumber = (formData.get('phoneNumber') as string | null)?.trim() || null
  const avatarUrl = (formData.get('avatarUrl') as string | null)?.trim() || null

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      username,
      bio,
      phone_number: phoneNumber,
      avatar_url: avatarUrl,
    })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: 'Update failed' }
  }

  revalidatePath('/profile', 'layout')
  return { success: true }
}
