'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { User, LogIn, UserPlus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserAuthPopupProps {
  user: SupabaseUser | null
  open: boolean
  onClose: () => void
  mode?: 'choice' | 'login' | 'signup'
  onModeChange?: (mode: 'choice' | 'login' | 'signup') => void
  redirectTo?: string
}

function AuthChoice({ onClose, onShowLogin, onShowSignup }: { onClose: () => void; onShowLogin: () => void; onShowSignup: () => void }) {
  return (
    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200">
      <div className="flex items-center justify-between p-3 border-b border-neutral-100">
        <span className="font-black text-neutral-900 tracking-tight uppercase text-sm">Campozy</span>
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Get Started</p>
        <Button
          onClick={onShowSignup}
          className="w-full justify-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Create Account
        </Button>
        <button
          onClick={onShowLogin}
          className="w-full text-sm font-bold text-primary hover:underline"
        >
          Already have an account? Log In
        </button>
      </div>
    </div>
  )
}

function AuthForm({ onClose, redirectTo, showSignupLink = true, onShowSignup }: { onClose: () => void; redirectTo: string; showSignupLink?: boolean; onShowSignup?: () => void }) {
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
        body: JSON.stringify({ email, password, next: redirectTo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Sign in failed.')
        setLoading(false)
        return
      }
      onClose?.()
      window.location.href = data.next || '/'
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200">
      <div className="flex items-center justify-between p-3 border-b border-neutral-100">
        <span className="font-black text-neutral-900 tracking-tight uppercase text-sm">Campozy</span>
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Sign in to your account</p>

        {error && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wide">Email</label>
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
            <div className="flex justify-between items-center mb-1">
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

        {showSignupLink && onShowSignup && (
          <div className="pt-2 text-center">
            <p className="text-neutral-500 text-sm font-medium">
              Don&apos;t have an account yet? <button onClick={onShowSignup} className="text-primary font-bold hover:underline">CREATE</button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SignupForm({ onClose, onShowLogin }: { onClose: () => void; onShowLogin: () => void }) {
  const router = useRouter()
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [formerSchool, setFormerSchool] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('fullName', fullName)
      formData.append('email', email)
      formData.append('formerSchool', formerSchool)
      formData.append('password', password)

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Sign up failed.')
        setLoading(false)
        return
      }

      onClose()
      router.push('/login?verified=1')
    } catch {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200">
      <div className="flex items-center justify-between p-3 border-b border-neutral-100">
        <span className="font-black text-neutral-900 tracking-tight uppercase text-sm">Campozy</span>
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Create Your Profile</p>

        {error && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your official name"
              required
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wide">University Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.ac"
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wide">Former School</label>
            <input
              type="text"
              value={formerSchool}
              onChange={(e) => setFormerSchool(e.target.value)}
              placeholder="Enter your former school name"
              required
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wide">Secure Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 characters"
              required
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button type="submit" className="w-full justify-center gap-2" disabled={loading}>
            {loading ? 'Creating...' : 'Create My Profile'}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-neutral-500 text-sm font-medium">
            Already have an account? <button onClick={onShowLogin} className="text-primary font-bold hover:underline">Log In</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export function UserAuthPopup({ user, open, onClose, mode = 'login', onModeChange, redirectTo = '/' }: UserAuthPopupProps) {
  const [showSignupLink, setShowSignupLink] = React.useState(true)

  const handleSwitchToLogin = () => {
    setShowSignupLink(false)
    onModeChange?.('login')
  }

  const handleSwitchToSignup = () => {
    setShowSignupLink(false)
    onModeChange?.('signup')
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 lg:p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />
      {user ? (
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200">
          <div className="flex items-center justify-between p-4 border-b border-neutral-100">
            <span className="font-black text-neutral-900 tracking-tight uppercase text-sm">Campozy</span>
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
      ) : mode === 'choice' ? (
        <AuthChoice onClose={onClose} onShowLogin={handleSwitchToLogin} onShowSignup={handleSwitchToSignup} />
      ) : mode === 'signup' ? (
        <SignupForm onClose={onClose} onShowLogin={handleSwitchToLogin} />
      ) : (
        <AuthForm onClose={onClose} redirectTo={redirectTo} showSignupLink={showSignupLink} onShowSignup={handleSwitchToSignup} />
      )}
    </div>,
    document.body
  )
}
