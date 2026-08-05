'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavDropdown } from './nav-dropdown'

interface NavGroup {
  label: string
  items: { href: string; label: string }[]
}

interface DesktopNavProps {
  navGroups: NavGroup[]
  housingHref?: string | null
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

export function DesktopNav({ navGroups, housingHref }: DesktopNavProps) {
  const pathname = usePathname()

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
              className={`px-4 py-2 text-sm font-bold uppercase tracking-tighter transition-all ${
                isActive
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-neutral-500 hover:text-primary'
              }`}
            >
              Housing
            </Link>
          )
        }
        return (
          <NavDropdown
            key={group.label}
            label={group.label}
            items={group.items}
            active={isGroupActive(group.items)}
          />
        )
      })}
      <NavLink href="/about" active={pathname === '/about'}>About</NavLink>
      <NavLink href="/opportunities" active={pathname === '/opportunities' || pathname.startsWith('/opportunities')}>Opportunities</NavLink>
      <NavLink href="/tips" active={pathname === '/tips' || pathname.startsWith('/tips')}>Tips &amp; Tricks</NavLink>
    </div>
  )
}
