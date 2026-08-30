'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { signup } from '@/app/actions/auth-actions'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'

export default function SignupPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true)
      setIsDesktop(window.innerWidth >= 1024)
    }, 0)

    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(id)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (mounted && !isDesktop) {
      router.replace('/signup/form')
    }
  }, [mounted, isDesktop, router])

  const [step, setStep] = useState<1 | 2>(1)

  const desktopModal =
    mounted && typeof document !== 'undefined' && isDesktop
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 lg:p-4">
            <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-neutral-100 p-3 flex items-center justify-between z-10">
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                    <span className="text-sm font-bold">C</span>
                  </div>
                  <span className="text-lg font-black tracking-tight text-neutral-900 uppercase">Campozy</span>
                </Link>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="font-bold text-neutral-600 hover:text-neutral-900">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Exit Onboarding
                  </Button>
                </Link>
              </div>

              <div className="p-4 lg:p-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-full mb-3">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">The Trust Network</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-tight">Create Your <span className="text-primary">Profile</span></h1>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className={`h-1.5 w-6 rounded-full ${step === 1 ? 'bg-primary' : 'bg-neutral-200'}`} />
                    <span className={`h-1.5 w-6 rounded-full ${step === 2 ? 'bg-primary' : 'bg-neutral-200'}`} />
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mb-4">
                  {step === 1 ? 'Step 1: Add your details.' : 'Step 2: Set a secure password.'}
                </p>

                <form className="space-y-4" action={signup}>
                  <input type="hidden" name="role" value="student" />

                  <div className={step === 1 ? '' : 'hidden'}>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Full Name</label>
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
                    </div>

                    <Button type="button" onClick={() => setStep(2)} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                      Continue
                    </Button>
                    <p className="mt-2 text-center text-xs text-neutral-500 font-medium">
                      Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                    </p>
                  </div>

                  <div className={step === 2 ? '' : 'hidden'}>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Secure Password</label>
                      <input
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        placeholder="Minimal 8 characters"
                        className="w-full px-3 h-11 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-0">
                      <Button type="button" variant="ghost" onClick={() => setStep(1)} className="font-bold text-neutral-600 hover:text-neutral-900">
                        Back
                      </Button>
                      <Button type="submit" className="flex-1 h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                        Create My Profile
                      </Button>
                    </div>
                    <p className="mt-2 text-center text-xs text-neutral-500 font-medium">
                      Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <div className="min-h-screen bg-neutral-50">
      {desktopModal}

      {/* Desktop body scroll lock when modal is open */}
      <style jsx global>{`
        body.modal-open {
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
