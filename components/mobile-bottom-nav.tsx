'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, MessageSquare, AlertTriangle, Rss, MessageCircle } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: React.ForwardRefExoticComponent<Omit<React.ComponentProps<'svg'>, 'ref'> & React.RefAttributes<SVGSVGElement>>
  paths: string[]
  accent?: boolean
}

const navItems: readonly NavItem[] = [
  { href: '/neighborhoods', label: 'Housing', icon: MapPin, paths: ['/neighborhoods', '/neighborhoods/[id]'] },
  { href: '/community', label: 'Community', icon: MessageSquare, paths: ['/community', '/founders', '/alumni', '/mentors', '/parents', '/ambassadors', '/scouts'] },
  { href: '/feed', label: 'Feed', icon: Rss, paths: ['/feed'] },
  { href: '/chat', label: 'Chat', icon: MessageCircle, paths: ['/chat', '/chat/[id]'] },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  const isActive = React.useCallback(
    (item: (typeof navItems)[number]) =>
      item.paths.some(
        (p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/')),
      ),
    [pathname],
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                item.accent
                  ? active
                    ? 'text-red-500'
                    : 'text-neutral-400'
                  : active
                    ? 'text-primary'
                    : 'text-neutral-400'
              }`}
            >
              <span
                className={`inline-flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
                  item.accent
                    ? active
                      ? 'bg-red-500/10 text-red-500'
                      : ''
                    : active
                      ? 'bg-primary/10 text-primary'
                      : ''
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
