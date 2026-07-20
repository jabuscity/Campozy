import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { login } from '@/app/actions/auth-actions'

export default function LoginPage() {
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
          <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-neutral-500">Sign in to your student trust network.</p>
        </div>

        <form className="space-y-6" action={login}>
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2 uppercase tracking-wide">
              Student Email
            </label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="e.g. name@university.ac" 
              className="w-full px-5 h-14 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wide">
                Password
              </label>
              <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
            </div>
            <input 
              name="password"
              type="password" 
              required
              placeholder="••••••••" 
              className="w-full px-5 h-14 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <Button type="submit" size="lg" className="w-full text-lg font-bold">
            Sign In
          </Button>
        </form>

        <div className="mt-10 pt-10 border-t border-neutral-100 text-center">
          <p className="text-neutral-500 mb-6 font-medium">Don&apos;t have an account yet?</p>
          <Link href="/signup">
            <Button variant="outline" size="lg" className="w-full border-2 border-neutral-200 hover:border-primary transition-all">
              Create Student Profile
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-neutral-400">
           <ShieldCheck className="h-4 w-4" />
           <span className="text-xs font-medium uppercase tracking-widest">Secured by Campozy Trust Engine</span>
        </div>
      </div>
    </div>
  )
}
