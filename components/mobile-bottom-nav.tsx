'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, MessageSquare, User, Plus } from 'lucide-react'
import { ReportUtilityModal } from './report-utility-modal'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/discovery', label: 'Housing', icon: MapPin },
  { href: '/community', label: 'Community', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [reportOpen, setReportOpen] = React.useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors ${
                  isActive ? 'text-primary' : 'text-neutral-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setReportOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 w-16 h-full text-primary"
            aria-label="Report Utility"
          >
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Report</span>
          </button>
        </div>
      </nav>

      <ReportUtilityModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </>
  )
}
