'use client'

import * as React from 'react'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import ReplyList from './reply-list'

interface Props {
  id: string | null
  onClose: () => void
}

export default function DiscussionModal({ id, onClose }: Props) {
  const [discussion, setDiscussion] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/community/discussion?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        setDiscussion(data.discussion || null)
      })
      .catch(() => setDiscussion(null))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <Dialog open={!!id} onClose={onClose} className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-neutral-900/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
          {loading && <div className="text-neutral-500">Loading...</div>}
          {!loading && discussion && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-neutral-900">{discussion.title}</h2>
              <p className="text-sm text-neutral-600">{discussion.content}</p>
              <div className="pt-4 border-t border-neutral-100">
                <ReplyList discussionId={discussion.id} initialReplies={[] as any} />
              </div>
            </div>
          )}
          {!loading && !discussion && (
            <div className="text-center text-neutral-500">Discussion not found.</div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
