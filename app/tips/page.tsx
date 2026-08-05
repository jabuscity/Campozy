import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TipsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <Link href="/" className="fixed top-8 left-8 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-6">💡</div>
        <h1 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Tips &amp; Tricks</h1>
        <p className="text-neutral-500 mb-8">Get the most out of Campozy with these helpful tips.</p>

        <div className="space-y-4 text-left">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <h3 className="font-bold text-neutral-900 mb-1">Verify Your Email</h3>
            <p className="text-sm text-neutral-600">Verify your student email to unlock full access to the trust network.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <h3 className="font-bold text-neutral-900 mb-1">Explore Neighborhoods</h3>
            <p className="text-sm text-neutral-600">Browse verified reviews and property details for neighborhoods near your campus.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <h3 className="font-bold text-neutral-900 mb-1">Connect with Peers</h3>
            <p className="text-sm text-neutral-600">Build your student network by connecting with classmates and alumni.</p>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-neutral-100 text-center">
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
          <span className="text-neutral-400 mx-2">|</span>
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}