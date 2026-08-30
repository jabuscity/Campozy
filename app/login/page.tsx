import Link from 'next/link'
import { ShieldCheck, CheckCircle2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientAuthPopup } from './auth-popup'

interface LoginPageProps {
  searchParams: Promise<{ verified?: string; error?: string; justLoggedOut?: string; next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/')
  }

  const params = await searchParams
  const verified = params.verified === '1'
  const error = params.error
  const justLoggedOut = params.justLoggedOut === '1'
  const next = params.next || '/'

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      {justLoggedOut && (
        <Link href="/" className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors" aria-label="Close">
          <X className="h-5 w-5" />
        </Link>
      )}
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/logo.svg" alt="Campozy" width={120} height={40} className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-neutral-500">Sign in to your student trust network.</p>
        </div>

        {verified && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm font-medium text-blue-800">Account created. Check your email to verify, then sign in.</p>
          </div>
        )}

        {error === 'verification_failed' && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">Verification failed. Please try again.</p>
          </div>
        )}

        <div className="flex justify-center">
          <ClientAuthPopup justLoggedOut={justLoggedOut} next={next} />
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-neutral-400">
           <ShieldCheck className="h-4 w-4" />
           <span className="text-xs font-medium uppercase tracking-widest">Secured by Campozy Trust Engine</span>
        </div>
      </div>
    </div>
  )
}
