import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ArrowLeft, GraduationCap, Building2, Search } from 'lucide-react'
import { signup } from '@/app/actions/auth-actions'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 py-20">
      <Link href="/" className="fixed top-8 left-8 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors bg-white px-4 py-2 rounded-xl border border-neutral-200 shadow-sm">
        <ArrowLeft className="h-4 w-4" /> Exit Onboarding
      </Link>

      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 border border-neutral-200 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Sidebar (Progress/Info) */}
          <div className="md:w-1/3 bg-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 blur-3xl" />
            <div>
               <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-primary mb-8 shadow-xl">
                  <span className="text-2xl font-black italic">C</span>
               </div>
               <h2 className="text-3xl font-black tracking-tighter uppercase mb-4 italic">Join the <br/>Network.</h2>
               <p className="text-primary-100 text-sm font-medium leading-relaxed opacity-80">
                  You're one step away from joining Africa's largest student trust network. Start by selecting your role.
               </p>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3 opacity-60">
                  <div className="h-2 w-2 rounded-full bg-white" />
                  <span className="text-xs font-bold uppercase tracking-widest">Identify</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">Credentials</span>
               </div>
               <div className="flex items-center gap-3 opacity-60">
                  <div className="h-2 w-2 rounded-full bg-white" />
                  <span className="text-xs font-bold uppercase tracking-widest">Verify</span>
               </div>
            </div>
          </div>

          {/* Right Section (Form) */}
          <div className="flex-1 p-12">
            <form className="space-y-8" action={signup}>
              <div className="space-y-4">
                 <label className="block text-sm font-black text-neutral-900 uppercase tracking-widest italic">Choose your role</label>
                 <div className="grid grid-cols-2 gap-4">
                    <button type="button" className="p-4 rounded-2xl border-2 border-primary bg-primary/5 text-left transition-all">
                       <GraduationCap className="h-6 w-6 text-primary mb-2" />
                       <span className="block font-bold text-neutral-900">Student</span>
                       <span className="text-[10px] text-primary/80 font-bold uppercase tracking-tighter">Looking for Hostels</span>
                    </button>
                    <button type="button" className="p-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50 text-left hover:border-neutral-200 transition-all opacity-60">
                       <Building2 className="h-6 w-6 text-neutral-400 mb-2" />
                       <span className="block font-bold text-neutral-900">Owner</span>
                       <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">List Properties</span>
                    </button>
                 </div>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Full Name</label>
                  <input 
                    name="fullName"
                    type="text" 
                    required
                    placeholder="Enter your official name" 
                    className="w-full px-5 h-14 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">University Email</label>
                  <input 
                    name="email"
                    type="email" 
                    required
                    placeholder="name@university.ac" 
                    className="w-full px-5 h-14 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Secure Password</label>
                  <input 
                    name="password"
                    type="password" 
                    required
                    placeholder="Minimal 8 characters" 
                    className="w-full px-5 h-14 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-4">
                 <Button type="submit" size="lg" className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20">
                   Create My Profile
                 </Button>
                 <p className="mt-6 text-center text-sm text-neutral-500 font-medium">
                   Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                 </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-12 flex items-center gap-6 text-neutral-400">
         <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Data</span>
         </div>
         <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Verification Pending</span>
         </div>
      </div>
    </div>
  )
}
