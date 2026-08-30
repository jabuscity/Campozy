'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { signup } from '@/app/actions/auth-actions'
import { useRouter } from 'next/navigation'
import { PasswordInput } from '@/components/ui/password-input'

export default function SignupFormPage() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      router.replace('/signup')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 pt-10 pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-2xl font-black text-neutral-900 tracking-tight leading-tight mb-1">
          Create Your <span className="text-primary">Profile</span>
        </h1>
        <p className="text-sm text-neutral-600 mb-5">Join the student trust network.</p>
      </div>

      <form className="px-5 pb-8 space-y-4" action={signup}>
        <input type="hidden" name="role" value="student" />

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-sm font-black text-neutral-900 uppercase tracking-widest">Full Name</label>
            <input
              name="fullName"
              type="text"
              required
              placeholder="Enter your official name"
              className="w-full px-3 h-11 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">
              University Email <span className="font-normal normal-case text-neutral-400">(optional)</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@university.ac"
              className="w-full px-3 h-11 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Former School</label>
            <input
              name="formerSchool"
              type="text"
              required
              placeholder="Enter your former school name"
              className="w-full px-3 h-11 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Secure Password</label>
            <PasswordInput
                name="password"
                autoComplete="new-password"
                required
                placeholder="Minimal 8 characters"
                className="w-full px-3 h-11 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
              />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
          Create My Profile
        </Button>
        <p className="mt-3 text-center text-sm text-neutral-500 font-medium">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  )
}
