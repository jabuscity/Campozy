'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { ArrowLeft, Lock } from 'lucide-react'
import { resetPassword } from '@/app/actions/auth-actions'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const token = searchParams.get('access_token')
    const type = searchParams.get('type')

    if (token && type === 'recovery') {
      const supabase = createClient()
      supabase.auth.setSession({ access_token: token, refresh_token: token }).then(({ error }) => {
        if (error) {
          setError('Invalid or expired reset link. Please request a new one.')
        } else {
          setSessionReady(true)
        }
      })
    } else {
      setTimeout(() => {
        setError('Invalid or missing reset link. Please request a new one.')
      }, 0)
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const result = await resetPassword(formData)

      if (result.error) {
        setError(result.error)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <Link href="/" className="fixed top-8 left-8 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <span className="text-3xl font-black text-white italic">C</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">Set New Password</h1>
          <p className="text-neutral-500">Choose a strong password for your account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <Link href="/forgot-password" className="text-sm font-bold text-primary hover:underline mt-2 inline-block">
              Request a new reset link
            </Link>
          </div>
        )}

        {sessionReady && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-wide">
                New Password
              </label>
              <PasswordInput
                name="password"
                autoComplete="new-password"
                required
                placeholder="Minimal 8 characters"
                className="w-full px-5 h-14 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            <Button type="submit" size="lg" className="w-full text-lg font-bold" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}

        {!sessionReady && !error && (
          <div className="flex items-center justify-center gap-2 text-neutral-400">
            <Lock className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Verifying reset link...</span>
          </div>
        )}

        <div className="mt-10 pt-10 border-t border-neutral-100 text-center">
          <p className="text-neutral-500 font-medium">
            Remember your password?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}