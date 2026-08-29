'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavDropdown } from './nav-dropdown'
import { useNotificationCounts } from '@/hooks/use-notification-counts'
import { NotificationBadge } from '@/components/ui/notification-badge'

interface NavGroup {
  label: string
  items: { href: string; label: string }[]
}

interface DesktopNavProps {
  navGroups: NavGroup[]
  housingHref?: string | null
}

export function DesktopNav({ navGroups, housingHref }: DesktopNavProps) {
  const pathname = usePathname()
  const counts = useNotificationCounts()

  const isGroupActive = (items: { href: string }[]) =>
    items.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))

  return (
    <div className="hidden lg:flex items-center gap-1">
      {navGroups.map((group) => {
        if (group.label === 'Housing' && housingHref) {
          const isActive = pathname === housingHref || pathname.startsWith(housingHref + '/')
          return (
              <Link
                key="housing"
                href={housingHref}
                className={`relative px-4 py-2 text-base font-bold capitalize tracking-tighter transition-all ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-neutral-500 hover:text-primary'
                }`}
              >
                Housing
                <NotificationBadge count={counts.housing} />
              </Link>
          )
        }
        if (group.label === 'Discussions' && group.items.length > 0) {
          const href = '/community'
          const isActive =
            pathname === '/community' ||
            (pathname.startsWith('/community/') && !pathname.startsWith('/community/events'))
          return (
            <Link
              key="discussions"
              href={href}
              className={`relative px-4 py-2 text-base font-bold capitalize tracking-tighter transition-all ${
                isActive
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-neutral-500 hover:text-primary'
              }`}
            >
              Discussions
              <NotificationBadge count={counts.discussions} />
            </Link>
          )
        }
        return (
          <NavDropdown
            key={group.label}
            label={group.label}
            items={group.items}
            active={isGroupActive(group.items)}
            count={group.label === 'Discussions' ? counts.discussions : undefined}
          />
        )
      })}
      <Link
        href="/opportunities"
        className={`relative px-4 py-2 text-base font-bold capitalize tracking-tighter transition-all ${
          pathname === '/opportunities' || pathname.startsWith('/opportunities')
            ? 'text-primary border-b-2 border-primary'
            : 'text-neutral-500 hover:text-primary'
        }`}
      >
        Opportunities
        <NotificationBadge count={counts.opportunities + counts.tips} />
      </Link>
      <Link
        href="/tips"
        className={`relative px-4 py-2 text-base font-bold capitalize tracking-tighter transition-all ${
          pathname === '/tips' || pathname.startsWith('/tips')
            ? 'text-primary border-b-2 border-primary'
            : 'text-neutral-500 hover:text-primary'
        }`}
      >
        Tips &amp; Tricks
        <NotificationBadge count={counts.tips} />
      </Link>
    </div>
  )
}
