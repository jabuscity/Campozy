'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { User, LogIn, UserPlus, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserAuthPopupProps {
  user: SupabaseUser | null
  open: boolean
  onClose: () => void
}

function AuthForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Sign in failed.')
        setLoading(false)
        return
      }

      onClose()
      router.refresh()
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200">
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <span className="font-black text-neutral-900 tracking-tight uppercase italic text-sm">Campozy</span>
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Sign in to your account</p>

        {error && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">Password</label>
              <Link href="/forgot-password" onClick={onClose} className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button type="submit" className="w-full justify-center gap-2" disabled={loading}>
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="pt-2">
          <Link href="?start_onboarding=1" onClick={onClose}>
            <Button variant="outline" className="w-full justify-center gap-2 border-2 border-neutral-200 hover:border-primary text-neutral-700 hover:text-primary">
              <UserPlus className="h-4 w-4" />
              Join Network
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function UserAuthPopup({ user, open, onClose }: UserAuthPopupProps) {
  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 lg:p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />
      {user ? (
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200">
          <div className="flex items-center justify-between p-4 border-b border-neutral-100">
            <span className="font-black text-neutral-900 tracking-tight uppercase italic text-sm">Campozy</span>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Welcome back</p>
            <Link href="/profile" onClick={onClose}>
              <Button className="w-full justify-center gap-2 bg-primary hover:bg-primary/90 text-white">
                <User className="h-4 w-4" /> Profile
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <AuthForm key={open ? 'open' : 'closed'} onClose={onClose} />
      )}
    </div>,
    document.body
  )
}
