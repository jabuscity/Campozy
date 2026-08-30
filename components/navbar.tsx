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
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-gradient-to-r from-neutral-50 via-white to-neutral-50 backdrop-blur-md overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] bg-[url('/patterns/beadmosaic.png')] bg-center mix-blend-multiply grayscale bg-[length:550px] lg:bg-[length:350px]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5" />
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
