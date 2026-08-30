'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { UserPlus, LogIn, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'campozy_guest_clicks'

export function GuestPrompt() {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const hasShown = React.useRef(false)

  React.useEffect(() => {
    if (hasShown.current) return

    const getCount = () => Number(sessionStorage.getItem(STORAGE_KEY) || '0')

    const increment = () => {
      const next = getCount() + 1
      sessionStorage.setItem(STORAGE_KEY, String(next))
      if (next >= 10 && !hasShown.current) {
        hasShown.current = true
        setTimeout(() => {
          setIsOpen(true)
        }, 50)
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const link = target?.closest('a') as HTMLAnchorElement | null
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || href.startsWith('javascript') || href.startsWith('#')) return
      increment()
    }

    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  const handleCreateAccount = () => {
    setIsOpen(false)
    router.replace('/?start_onboarding=1')
  }

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="">
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserPlus className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-neutral-900">Join Campozy</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Sign up to personalize your experience, save favorite hostels, connect with roommates, and get campus-specific recommendations.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Button size="lg" className="w-full gap-2" onClick={handleCreateAccount}>
            <UserPlus className="h-4 w-4" />
            Create Account
          </Button>
          <Link href="/login" onClick={() => setIsOpen(false)}>
            <Button size="lg" variant="outline" className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="h-3 w-3" />
          Maybe later
        </button>
      </div>
    </Modal>
  )
}
