'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { NotificationBadge } from '@/components/ui/notification-badge'

interface NavDropdownProps {
  label: string
  items: { href: string; label: string }[]
  active?: boolean
  count?: number
}

export function NavDropdown({ label, items, active, count }: NavDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative flex items-center gap-1 px-4 py-2 text-base font-bold capitalize tracking-tighter transition-all ${
          active
            ? 'text-primary border-b-2 border-primary'
            : 'text-neutral-500 hover:text-primary'
        }`}
      >
        {label}
        <NotificationBadge count={count} />
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 pt-2 z-50">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-lg py-2 min-w-[200px]">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 text-sm font-bold text-neutral-600 hover:text-primary hover:bg-neutral-50 transition-all"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
