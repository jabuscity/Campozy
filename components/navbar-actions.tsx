'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from './ui/button'
import { MessageSquare, CalendarDays, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { UserAuthPopup } from './user-auth-popup'
import { useNotificationCounts } from '@/hooks/use-notification-counts'
import { NotificationBadge } from '@/components/ui/notification-badge'

interface NavbarActionsProps {
  user: SupabaseUser | null
}

export function NavbarActions({ user }: NavbarActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [authOpen, setAuthOpen] = useState(false)
  const counts = useNotificationCounts()
  const isEventsActive = pathname === '/community/events' || pathname.startsWith('/community/events')
  const isChatActive = pathname === '/chat' || pathname.startsWith('/chat')
  const isProfileActive = pathname === '/profile' || pathname.startsWith('/profile')

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <Link href="/chat">
            <Button
              variant="ghost"
              size="icon"
              className={`relative hidden sm:flex cursor-pointer !text-neutral-500 hover:!bg-primary/10 !hover:text-primary ${isChatActive ? '!text-primary !bg-primary/10' : ''}`}
            >
              <MessageSquare className="h-5 w-5" />
              <NotificationBadge count={counts.chat} />
            </Button>
          </Link>
          <Link href="/community/events">
            <Button
              variant="ghost"
              size="icon"
              className={`relative cursor-pointer !text-neutral-500 hover:!bg-primary/10 !hover:text-primary ${isEventsActive ? '!text-primary !bg-primary/10' : ''}`}
            >
              <CalendarDays className="h-5 w-5" />
              <NotificationBadge count={counts.discussions} />
            </Button>
          </Link>
            <button
              onClick={() => router.push('/profile')}
              aria-label="Profile"
              className={`relative inline-flex items-center justify-center h-10 w-10 rounded-full transition-all cursor-pointer !text-neutral-500 hover:!bg-primary/10 !hover:text-primary ${isProfileActive ? '!text-primary !bg-primary/10' : ''}`}
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setAuthOpen(true)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 transition-colors lg:hidden"
            aria-label="Account"
          >
            <User className="h-4 w-4 text-neutral-600" />
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setAuthOpen(true)}
            className="hidden sm:inline-flex font-bold px-6"
          >
            Sign In
          </Button>
        </>
      )}
      <UserAuthPopup user={user} open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
