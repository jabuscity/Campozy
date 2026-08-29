'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NotificationType } from '@/types'

type SectionKey = 'housing' | 'discussions' | 'opportunities' | 'tips' | 'feed' | 'chat'
export type { SectionKey }

const TYPE_TO_SECTION: Record<NotificationType, SectionKey[]> = {
  review: ['housing'],
  verification: ['housing'],
  opportunity: ['opportunities'],
  message: ['chat'],
  founder: ['discussions'],
  system: ['discussions'],
  alert: ['housing'],
  utility_report: ['housing'],
  tip_suggestion: ['tips'],
  opportunity_suggestion: ['opportunities'],
}

export function useNotificationCounts() {
  const [counts, setCounts] = React.useState<Record<SectionKey, number>>({
    housing: 0,
    discussions: 0,
    opportunities: 0,
    tips: 0,
    feed: 0,
    chat: 0,
  })

  const refresh = React.useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setCounts({ housing: 0, discussions: 0, opportunities: 0, tips: 0, feed: 0, chat: 0 })
        return
      }

      const [notificationsResult, unreadChat] = await Promise.all([
        supabase
          .from('notifications')
          .select('type, is_read')
          .eq('user_id', user.id)
          .eq('is_read', false),
        getChatUnreadCount(user.id),
      ])

      const notifications = notificationsResult.data
      const notificationsError = notificationsResult.error

      const sectionCounts: Record<SectionKey, number> = {
        housing: 0,
        discussions: 0,
        opportunities: 0,
        tips: 0,
        feed: 0,
        chat: typeof unreadChat === 'number' ? unreadChat : 0,
      }

      if (!notificationsError && notifications) {
        for (const n of notifications) {
          const sections = TYPE_TO_SECTION[n.type as NotificationType] || []
          for (const section of sections) {
            sectionCounts[section]++
          }
        }
      }

      setCounts(sectionCounts)
    } catch {
      // ignore transient network/auth failures
    }
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()

    const interval = setInterval(refresh, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [refresh])

  return counts
}

async function getChatUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversation_members')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (error || !data || data.length === 0) return 0

  let total = 0
  for (const member of data) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', member.conversation_id)
      .neq('sender_id', userId)
      .gt('created_at', member.last_read_at || '1970-01-01')

    total += count || 0
  }

  return total
}
