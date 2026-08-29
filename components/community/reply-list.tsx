'use client'

import * as React from 'react'
import { MessageSquare, ChevronDown, ChevronUp, CornerDownLeft } from 'lucide-react'
import ReplyEditor from './reply-editor'
import type { DiscussionReply } from '@/types'
import { CommunityService } from '@/services/community-service'

interface Props {
  discussionId: string
  initialReplies?: DiscussionReply[]
}

export default function ReplyList({ discussionId, initialReplies = [] }: Props) {
  const [replies, setReplies] = React.useState<DiscussionReply[]>(initialReplies)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (initialReplies.length === 0) {
      setLoading(true)
      CommunityService.getReplies(discussionId)
        .then((r) => setReplies(r))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [discussionId])

  async function addReply(content: string) {
    // call service; optimistic update handled after success
    try {
      const newReply = await CommunityService.addReply(discussionId, content, 'system')
      setReplies(prev => [...prev, newReply])
    } catch (err) {
      // noop for now
      throw err
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-500 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span>{replies.length} repl{replies.length === 1 ? 'y' : 'ies'}</span>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-sm text-neutral-400">Loading replies...</div>}
        {replies.map(r => (
          <div key={r.id} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">
                {r.author?.full_name?.[0] || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-neutral-900">{r.author?.full_name || 'Anonymous'}</div>
                  <div className="text-xs text-neutral-400">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <p className="text-sm text-neutral-700 mt-1">{r.content}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                  <button className="inline-flex items-center gap-1">
                    <CornerDownLeft className="h-3 w-3" /> Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <ReplyEditor onSubmit={addReply} />
      </div>
    </div>
  )
}
