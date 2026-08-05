'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { MessageSquare, Bell, User } from 'lucide-react'
import { ReportTrigger } from './report-trigger'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { UserAuthPopup } from './user-auth-popup'

interface NavbarActionsProps {
  user: SupabaseUser | null
}

export function NavbarActions({ user }: NavbarActionsProps) {
  const router = useRouter()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <Button variant="ghost" size="icon" className="text-neutral-500 relative hidden sm:flex">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-secondary ring-2 ring-white" />
          </Button>
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="text-neutral-500 hidden sm:flex">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>
          <ReportTrigger />
          <button
            onClick={() => router.push('/profile')}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 transition-colors"
            aria-label="Profile"
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
