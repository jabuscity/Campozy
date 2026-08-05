'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createDiscussionAction(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const categoryId = formData.get('categoryId') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: discussion, error } = await supabase
    .from('discussions')
    .insert({
      title,
      content,
      user_id: user.id,
      category_id: categoryId || null,
      campus_id: null,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create discussion: ${error.message}`)
  }

  revalidatePath('/community')
  redirect(`/community?discussion=${discussion.id}`)
}
