'use client'

import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { Footer } from '@/components/footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { UniversityTicker } from '@/components/university-ticker'

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback)
  return () => window.removeEventListener('resize', callback)
}

function getSnapshot() {
  return window.innerWidth < 1024
}

function getServerSnapshot() {
  return false
}

export function FooterGate() {
  const pathname = usePathname()
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const isHomeOrAbout = pathname === '/' || pathname === '/about'
  const showTicker = pathname === '/'

  return (
    <>
      {showTicker ? <UniversityTicker /> : null}
      {!isMobile || isHomeOrAbout ? <Footer /> : null}
      <MobileBottomNav />
    </>
  )
}
