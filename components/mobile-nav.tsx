'use client'

import Link from 'next/link'
import { Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface MobileNavProps {
  user: SupabaseUser | null
  items: { href: string; label: string }[]
}

export function MobileNav({ user, items }: MobileNavProps) {
  const router = useRouter()

  return (
    <details className="lg:hidden">
      <summary className="list-none p-2 cursor-pointer text-neutral-500 hover:text-primary">
        <Menu className="h-6 w-6" />
      </summary>
      <div className="absolute left-0 right-0 top-full bg-white border-b border-neutral-200 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-2">
            {user ? (
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white justify-center"
                onClick={() => router.push('/profile')}
              >
                <User className="h-4 w-4" /> Profile
              </Button>
            ) : (
              <Link href="/signup">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white justify-center">
                  Join
                </Button>
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-sm font-bold text-neutral-500 hover:text-primary hover:bg-neutral-50 rounded-xl transition-all uppercase tracking-tighter"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </details>
  )
}
