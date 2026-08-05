'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bell, Lock, Eye, Mail, Smartphone, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type NotificationSetting = {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: React.ReactNode
}

type PrivacySetting = {
  id: string
  label: string
  description: string
  value: boolean
  icon: React.ReactNode
}

export default function SettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'email_notifications',
      label: 'Email Notifications',
      description: 'Receive email updates about your account activity',
      enabled: true,
      icon: <Mail className="h-5 w-5 text-primary" />,
    },
    {
      id: 'push_notifications',
      label: 'Push Notifications',
      description: 'Receive push notifications in your browser',
      enabled: true,
      icon: <Smartphone className="h-5 w-5 text-primary" />,
    },
    {
      id: 'opportunity_alerts',
      label: 'Opportunity Alerts',
      description: 'Get notified about new opportunities matching your profile',
      enabled: true,
      icon: <Bell className="h-5 w-5 text-primary" />,
    },
    {
      id: 'connection_requests',
      label: 'Connection Requests',
      description: 'Receive notifications when someone wants to connect',
      enabled: true,
      icon: <Globe className="h-5 w-5 text-primary" />,
    },
  ])

  const [privacy, setPrivacy] = useState<PrivacySetting[]>([
    {
      id: 'public_profile',
      label: 'Public Profile',
      description: 'Allow others to view your profile',
      value: true,
      icon: <Eye className="h-5 w-5 text-primary" />,
    },
    {
      id: 'show_contact_info',
      label: 'Show Contact Info',
      description: 'Display your phone number and email to others',
      value: false,
      icon: <Mail className="h-5 w-5 text-primary" />,
    },
    {
      id: 'show_activity',
      label: 'Show Activity',
      description: 'Allow others to see your recent activity',
      value: true,
      icon: <Eye className="h-5 w-5 text-primary" />,
    },
    {
      id: 'allow_messages',
      label: 'Allow Messages',
      description: 'Let others send you direct messages',
      value: true,
      icon: <Lock className="h-5 w-5 text-primary" />,
    },
  ])

  const handleNotificationToggle = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    )
  }

  const handlePrivacyToggle = (id: string) => {
    setPrivacy(prev =>
      prev.map(p => p.id === id ? { ...p, value: !p.value } : p)
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const notificationPrefs: Record<string, boolean> = {}
      notifications.forEach(n => {
        notificationPrefs[n.id] = n.enabled
      })

      const privacyPrefs: Record<string, boolean> = {}
      privacy.forEach(p => {
        privacyPrefs[p.id] = p.value
      })

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          notification_preferences: notificationPrefs,
          privacy_preferences: privacyPrefs,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Settings saved successfully.' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <Link href="/profile" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Settings
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage your notification and privacy preferences.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-neutral-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                Notifications
              </h2>
            </div>
            <p className="text-sm text-neutral-500 mb-6">
              Choose what notifications you want to receive.
            </p>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    {notification.icon}
                    <div>
                      <p className="font-bold text-neutral-900">{notification.label}</p>
                      <p className="text-sm text-neutral-500">{notification.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle(notification.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notification.enabled ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notification.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                Privacy
              </h2>
            </div>
            <p className="text-sm text-neutral-500 mb-6">
              Control who can see your information and activity.
            </p>
            <div className="space-y-4">
              {privacy.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    {setting.icon}
                    <div>
                      <p className="font-bold text-neutral-900">{setting.label}</p>
                      <p className="text-sm text-neutral-500">{setting.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrivacyToggle(setting.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      setting.value ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        setting.value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-full font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full font-bold"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
