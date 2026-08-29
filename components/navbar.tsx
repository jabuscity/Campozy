import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NavbarActions } from './navbar-actions'
import { DesktopNav } from './desktop-nav'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const housingHref = '/neighborhoods'

  const navGroups = [
    { label: 'Housing', items: [] },
    { label: 'Discussions', items: [
        { href: '/community', label: 'Discussions' },
        { href: '/connections', label: 'Connections' },
      ]},
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-blue-100 bg-blue-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href={user ? '/feed' : '/'} className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-transform group-hover:scale-110">
              <span className="text-xl font-bold italic">C</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-neutral-900 italic">
              Campozy
            </span>
          </Link>

          <DesktopNav navGroups={navGroups} housingHref={housingHref} />
        </div>

        <NavbarActions user={user} />
      </div>
    </nav>
  )
}
