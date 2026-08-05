'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail } from 'lucide-react'
import { forgotPassword } from '@/app/actions/auth-actions'
import { useToast } from '@/components/ui/toaster'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await forgotPassword(new FormData(e.currentTarget as HTMLFormElement))

      if (result.error) {
        toast(result.error, 'error')
      } else {
        setSubmitted(true)
      }
    } catch {
      toast('Something went wrong. Please try again.', 'error')
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
          <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">Reset Password</h1>
          <p className="text-neutral-500">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-green-50 border border-green-200 text-center">
            <Mail className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-green-800">
              If an account with that email exists, a password reset link has been sent.
            </p>
            <Link href="/login" className="text-sm font-bold text-primary hover:underline mt-3 inline-block">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-wide">
                Student Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="e.g. name@university.ac"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 h-14 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            <Button type="submit" size="lg" className="w-full text-lg font-bold" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
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