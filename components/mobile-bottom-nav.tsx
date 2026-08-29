'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, MessageSquare, MessageCircle, Briefcase, Lightbulb } from 'lucide-react'
import { useNotificationCounts } from '@/hooks/use-notification-counts'
import { NotificationBadge } from '@/components/ui/notification-badge'

type NavItem = {
  type?: 'nav'
  href: string
  label: string
  icon: React.ForwardRefExoticComponent<Omit<React.ComponentProps<'svg'>, 'ref'> & React.RefAttributes<SVGSVGElement>>
  paths: string[]
  accent?: boolean
}

const navItems: readonly NavItem[] = [
  { href: '/neighborhoods', label: 'Housing', icon: MapPin, paths: ['/neighborhoods', '/neighborhoods/[id]'] },
  { href: '/community', label: 'Discussions', icon: MessageSquare, paths: ['/community', '/founders', '/alumni', '/mentors', '/parents', '/ambassadors', '/scouts'] },
  { href: '/tips', label: 'Tips', icon: Lightbulb, paths: ['/tips'] },
  { href: '/chat', label: 'Chat', icon: MessageCircle, paths: ['/chat', '/chat/[id]'] },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const counts = useNotificationCounts()

  const isActive = React.useCallback(
    (item: (typeof navItems)[number]) => {
      const exactMatch = item.paths.some(p => pathname === p)
      if (exactMatch) return true

      const anyExactMatch = navItems.some(other => other.paths.some(p => pathname === p))
      if (anyExactMatch) return false

      return item.paths.some(
        p => p !== '/' && pathname.startsWith(p + '/'),
      )
    },
    [pathname],
  )

  const items: Array<NavItem | { type: 'center' }> = [
    ...navItems.slice(0, 2),
    { type: 'center' as const },
    ...navItems.slice(2),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-blue-50 border-t border-blue-100 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          if ('type' in item && item.type === 'center') {
            const active = pathname === '/opps'
            const oppsCount = counts.opportunities || 0
            return (
              <Link
                key="center-btn"
                href="/opps"
                className="relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors"
              >
                <span
                  className={`inline-flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
                    active ? 'bg-primary/10 text-primary' : 'text-neutral-400'
                  }`}
                >
                  <Briefcase className="h-5 w-5" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Opps</span>
                </span>
                <NotificationBadge count={oppsCount} />
              </Link>
            )
          }

          const active = isActive(item)
          const Icon = item.icon
          const sectionKey = item.href === '/neighborhoods' ? 'housing' : item.href === '/community' ? 'discussions' : item.href === '/tips' ? 'tips' : 'chat'
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
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
              <NotificationBadge count={counts[sectionKey]} />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
