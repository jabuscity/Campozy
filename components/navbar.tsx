import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NavbarActions } from './navbar-actions'
import { DesktopNav } from './desktop-nav'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let avatarUrl: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
    avatarUrl = profile?.avatar_url ?? null
  }

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
            <img src="/logo.svg" alt="Campozy" className="h-10 w-auto object-contain transition-transform group-hover:scale-110 hidden sm:block" width={120} height={40} />
            <span className="text-2xl font-black tracking-tight text-neutral-900">
              Campozy
            </span>
          </Link>

          <DesktopNav navGroups={navGroups} housingHref={housingHref} />
        </div>

        <NavbarActions user={user} avatarUrl={avatarUrl} />
      </div>
    </nav>
  )
}
