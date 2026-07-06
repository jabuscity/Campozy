import Link from 'next/link'
import { SearchTrigger } from './search-trigger'
import { Button } from './ui/button'
import { createClient } from '@/lib/supabase/server'
import { MessageSquare, Bell, User } from 'lucide-react'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-transform group-hover:scale-110">
              <span className="text-xl font-bold italic">C</span>
            </div>
            <span className="text-xl font-black tracking-tight text-neutral-900 uppercase italic">
              Campozy
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <NavLink href="/discovery">Housing</NavLink>
            <NavLink href="/community">Community</NavLink>
            <NavLink href="/opportunities">Opportunities</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SearchTrigger />
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="text-neutral-500 relative">
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-secondary ring-2 ring-white" />
              </Button>
              <Button variant="ghost" size="icon" className="text-neutral-500">
                <Bell className="h-5 w-5" />
              </Button>
              <Link href="/profile">
                <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden hover:border-primary transition-colors">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-bold">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm" className="hidden sm:inline-flex font-bold px-6">Join Network</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-primary transition-all uppercase tracking-tighter"
    >
      {children}
    </Link>
  )
}
