'use client'

import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'

export function ProfileLink() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/profile')}
      className="ml-2 hidden sm:flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden hover:border-primary transition-colors"
      aria-label="Profile"
    >
      <User className="h-5 w-5 text-neutral-500 pointer-events-none" />
    </button>
  )
}
