'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, MessageCircle, MessageSquare } from 'lucide-react'

interface CommunityCreateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CommunityCreateModal({ isOpen, onClose }: CommunityCreateModalProps) {
  const router = useRouter()
  const [forums, setForums] = React.useState<Array<{ id: string; name: string }>>([])
  const [loadingForums, setLoadingForums] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) return
    setLoadingForums(true)
    ;(async () => {
      try {
        const { data } = await createClient()
          .from('forums')
          .select('id, name')
          .order('name', { ascending: true })
        setForums(data || [])
      } catch {
        setForums([])
      } finally {
        setLoadingForums(false)
      }
    })()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-neutral-200 max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Create</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => {
              onClose()
              router.push('/community/ask')
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-neutral-50 hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-neutral-900 text-sm">Ask a Question</p>
              <p className="text-xs text-neutral-500">Start a discussion with the community</p>
            </div>
          </button>

          <div>
            <p className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-2 px-1">Post in Forum</p>
            {loadingForums ? (
              <div className="p-4 text-center text-sm text-neutral-500">Loading forums...</div>
            ) : forums.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">No forums available yet.</div>
            ) : (
              <div className="space-y-2">
                {forums.map((forum) => (
                  <button
                    key={forum.id}
                    onClick={() => {
                      onClose()
                      router.push(`/forums/${forum.id}`)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-white hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-neutral-900 text-sm">{forum.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}