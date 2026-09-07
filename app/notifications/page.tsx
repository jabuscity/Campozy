'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bell, CheckCheck } from 'lucide-react'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notification-service'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadNotifications() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)
      const data = await getNotifications(user.id)
      setNotifications(data)
      setLoading(false)
    }

    loadNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
  }

  const handleMarkAllAsRead = async () => {
    if (!userId) return
    await markAllNotificationsAsRead(userId)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded-lg w-1/4" />
            <div className="h-32 bg-neutral-200 rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-200 py-8 md:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight uppercase">Notifications</h1>
              <p className="text-neutral-600">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" onClick={handleMarkAllAsRead} className="text-sm font-bold">
                <CheckCheck className="h-4 w-4 mr-2" /> Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
            <Bell className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-neutral-900 mb-2">No notifications yet</h3>
            <p className="text-neutral-500">We&apos;ll notify you when something important happens.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl border p-4 md:p-5 transition-all ${
                  notification.is_read ? 'border-neutral-200' : 'border-primary/20 bg-primary/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notification.is_read ? 'bg-neutral-100 text-neutral-400' : 'bg-primary/10 text-primary'
                  }`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-neutral-900 mb-1">{notification.title}</h3>
                    <p className="text-sm text-neutral-600 mb-2">{notification.content}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                      {notification.link && (
                        <Link href={notification.link} className="text-xs font-bold text-primary hover:underline">
                          View details
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs font-bold text-neutral-400 hover:text-neutral-600 px-2 py-1 rounded-lg hover:bg-neutral-50"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
