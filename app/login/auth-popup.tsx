'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { UserAuthPopup } from '@/components/user-auth-popup'

export function ClientAuthPopup({ justLoggedOut, next }: { justLoggedOut: boolean; next: string }) {
  const [mode, setMode] = React.useState<'choice' | 'login' | 'signup'>('choice')
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    const detectMode = async () => {
      if (justLoggedOut) {
        setMode('login')
        setLoading(false)
        return
      }

      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/')
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setMode('login')
        } else {
          setMode('choice')
        }
      } catch {
        setMode('choice')
      } finally {
        setLoading(false)
      }
    }

    detectMode()
  }, [justLoggedOut, router])

  if (loading) return null

  return (
    <UserAuthPopup
      user={null}
      open={true}
      onClose={() => router.replace('/')}
      mode={mode}
      onModeChange={setMode}
      redirectTo={next}
    />
  )
}
