import Link from 'next/link'
import { SearchTrigger } from './search-trigger'
import { Button } from './ui/button'
import { createClient } from '@/lib/supabase/server'
import { MessageSquare, Bell, User, Menu } from 'lucide-react'
import { NavDropdown } from './nav-dropdown'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const navGroups = [
    { label: 'Housing', items: [
        { href: '/discovery', label: 'Hostels' },
        { href: '/campuses', label: 'Campuses' },
        { href: '/universities', label: 'Universities' },
        { href: '/neighborhoods', label: 'Neighborhoods' },
        { href: '/businesses', label: 'Businesses' },
      ]},
    { label: 'Community', items: [
        { href: '/community', label: 'Discussions' },
        { href: '/founders', label: 'Founders' },
        { href: '/alumni', label: 'Alumni' },
        { href: '/mentors', label: 'Mentors' },
        { href: '/parents', label: 'Parents' },
        { href: '/ambassadors', label: 'Ambassadors' },
        { href: '/scouts', label: 'Scouts' },
      ]},
    { label: 'Opportunities', items: [
        { href: '/opportunities', label: 'Opportunities' },
        { href: '/employers', label: 'Employers' },
        { href: '/resources', label: 'Resources' },
      ]},
  ]

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

          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/" active>Home</NavLink>
            {navGroups.map((group) => (
              <NavDropdown
                key={group.label}
                label={group.label}
                items={group.items}
              />
            ))}
            <NavLink href="/about">About</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SearchTrigger />
          <MobileNav items={[
            { href: '/', label: 'Home' },
            ...navGroups.flatMap(g => g.items),
            { href: '/about', label: 'About' },
            { href: '/profile', label: 'Profile' },
          ]} />
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="text-neutral-500 relative hidden sm:flex">
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-secondary ring-2 ring-white" />
              </Button>
              <Button variant="ghost" size="icon" className="text-neutral-500 hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Link href="/profile">
                <div className="ml-2 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden hover:border-primary transition-colors">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-bold hidden sm:flex">Sign In</Button>
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

function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  return (
    <details className="lg:hidden">
      <summary className="list-none p-2 cursor-pointer text-neutral-500 hover:text-primary">
        <Menu className="h-6 w-6" />
      </summary>
      <div className="absolute left-0 right-0 top-full bg-white border-b border-neutral-200 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-3 text-sm font-bold text-neutral-500 hover:text-primary hover:bg-neutral-50 rounded-xl transition-all uppercase tracking-tighter"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </details>
  )
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-bold uppercase tracking-tighter transition-all ${
        active
          ? 'text-primary border-b-2 border-primary'
          : 'text-neutral-500 hover:text-primary'
      }`}
    >
      {children}
    </Link>
  )
}

