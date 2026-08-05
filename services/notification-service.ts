'use client'

import { createClient } from '@/lib/supabase/client'
import type { NotificationType } from '@/types'

export async function sendUtilityReportNotifications(params: {
  incidentId: string
  propertyId: string | null
  campusId: string | null
  utilityType: string
  severity: string
  description: string
  reportedBy: string
  title: string
}) {
  const supabase = createClient()
  const notifications: {
    user_id: string
    type: NotificationType
    title: string
    content: string
    link: string | null
  }[] = []

  if (params.propertyId) {
    const { data: property } = await supabase
      .from('properties')
      .select('name, neighborhoods(cities(name))')
      .eq('id', params.propertyId)
      .single()

    const { data: scoutAssignments } = await supabase
      .from('scout_assignments')
      .select('scout_id, scouts(user_id, region_id)')
      .eq('property_id', params.propertyId)
      .eq('status', 'assigned')

    for (const assignment of scoutAssignments || []) {
      const scout = (assignment as unknown as { scouts: { user_id: string; region_id: string } | null }).scouts
      if (scout?.user_id) {
        notifications.push({
          user_id: scout.user_id,
          type: 'alert',
          title: `Utility Issue in Your Assignment: ${params.utilityType}`,
          content: `${params.title} at ${property?.name || 'property'}.`,
          link: params.propertyId ? `/property/${params.propertyId}` : null,
        })
      }
    }
  }

  if (params.campusId) {
    const { data: ambassadors } = await supabase
      .from('ambassadors')
      .select('user_id, ambassador_programs!inner(campus_id)')
      .eq('ambassador_programs.campus_id', params.campusId)
      .eq('status', 'active')

    for (const ambassador of ambassadors || []) {
      notifications.push({
        user_id: ambassador.user_id,
        type: 'alert',
        title: `Campus Utility Report: ${params.utilityType}`,
        content: `${params.title}. Severity: ${params.severity}.`,
        link: params.propertyId ? `/property/${params.propertyId}` : '/community',
      })
    }
  }

  if (notifications.length > 0) {
    const { error } = await supabase
      .from('notifications')
      .insert(notifications.map(n => ({
        ...n,
        is_read: false,
      })))

    if (error) {
      console.error('Failed to send notifications:', error)
    }
  }

  return notifications.length
}

export async function getNotifications(userId: string, limit = 20) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }

  return data || []
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

