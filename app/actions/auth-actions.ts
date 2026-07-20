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
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string
  const formerSchool = formData.get('formerSchool') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error || !data.user) {
    redirect('/signup?error=create_failed')
  }

  const userId = data.user.id

  if (role === 'student') {
    if (formerSchool && formerSchool.trim()) {
      const { data: schoolData, error: schoolError } = await supabase
        .from('high_schools')
        .upsert(
          { name: formerSchool.trim() },
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
  }

  if (role === 'owner') {
    const ownerAddress = (address || '').trim()
    const ownerPhone = (phone || '').trim()

    if (!ownerAddress) {
      redirect('/signup?error=missing_address')
    }

    await supabase.from('owners').insert({
      id: userId,
      address: ownerAddress,
    })

    if (ownerPhone) {
      await supabase
        .from('profiles')
        .update({ phone: ownerPhone })
        .eq('id', userId)
    }
  }

  if (role && role !== 'student') {
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single()

    if (!roleError && roleData) {
      await supabase.from('user_roles').delete().eq('user_id', userId)
      await supabase.from('user_roles').insert({
        user_id: userId,
        role_id: roleData.id,
      })
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
