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

export async function createEventAction(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const eventType = formData.get('event_type') as string
  const location = formData.get('location') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const maxAttendees = formData.get('max_attendees') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      event_type: eventType,
      location: location || null,
      start_time: startTime,
      end_time: endTime || null,
      max_attendees: maxAttendees ? Number(maxAttendees) : null,
      organizer_id: user.id,
      is_public: true,
      campus_id: null,
    })

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`)
  }

  revalidatePath('/community/events')
  redirect('/community/events?created=1')
}
