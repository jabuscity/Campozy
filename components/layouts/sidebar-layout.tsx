'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface SidebarItem {
  href: string
  label: string
  icon?: React.ReactNode
}

interface SidebarLayoutProps {
  title: string
  items: SidebarItem[]
  children: React.ReactNode
}

export function SidebarLayout({ title, items, children }: SidebarLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl">
        <div className="lg:flex lg:gap-8">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20 py-4">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 px-4">
                {title}
              </h3>
              <nav className="space-y-1">
                {items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href + '/'))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
