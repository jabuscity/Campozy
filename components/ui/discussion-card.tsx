import * as React from 'react'
import { MessageSquare, ThumbsUp, ThumbsDown, ChevronDown, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { DiscussionReply as DiscussionReplyType } from '@/types'

interface DiscussionCardProps {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: string
  upvotes?: number
  downvotes?: number
  userVote?: number | null
  commentCount: number
  categoryName?: string
  replies?: DiscussionReplyType[]
  className?: string
  isExpanded?: boolean
  onMobileClick?: (id: string) => void
  onDesktopClick?: (id: string) => void
  onVote?: (id: string, voteType: 1 | -1) => void
  onReply?: () => void
  isReplying?: boolean
  replyText?: string
  onReplyTextChange?: (text: string) => void
  onCancelReply?: () => void
  onSubmitReply?: () => void
  sendingReply?: boolean
  replyPosted?: boolean
  replyError?: string | null
  onReplyToReply?: (replyId: string, content: string) => Promise<void> | void
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'general': { bg: 'bg-neutral-100', text: 'text-neutral-600' },
  'academics': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'hostels': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'campus life': { bg: 'bg-green-100', text: 'text-green-700' },
  'relationships': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'faith': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'events': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'marketplace': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'technology': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'careers': { bg: 'bg-sky-100', text: 'text-sky-700' },
}

function getCategoryColor(categoryName?: string): { bg: string; text: string } {
  if (!categoryName) return { bg: 'bg-neutral-100', text: 'text-neutral-600' }
  return CATEGORY_COLORS[categoryName.toLowerCase()] || { bg: 'bg-neutral-100', text: 'text-neutral-600' }
}

export function DiscussionCard({
  id,
  title,
  content,
  authorName,
  createdAt,
  upvotes = 0,
  downvotes = 0,
  userVote,
  commentCount,
  categoryName,
  replies,
  className,
  isExpanded,
  onMobileClick,
  onDesktopClick,
  onVote,
  onReply,
  isReplying,
  replyText,
  onReplyTextChange,
  onCancelReply,
  onSubmitReply,
  sendingReply,
  replyPosted,
  replyError,
}: DiscussionCardProps) {
  const categoryColor = getCategoryColor(categoryName)
  const [activeReplyId, setActiveReplyId] = React.useState<string | null>(null)
  const [replyToReplyText, setReplyToReplyText] = React.useState('')
  const [replyToReplySending, setReplyToReplySending] = React.useState(false)
  const [replyToReplyPosted, setReplyToReplyPosted] = React.useState(false)

  React.useEffect(() => {
    if (isReplying) setActiveReplyId(null)
  }, [isReplying])

  async function submitReplyToReply(replyId: string) {
    if (!onReplyToReply || !replyToReplyText.trim()) return
    setReplyToReplySending(true)
    try {
      await onReplyToReply(replyId, replyToReplyText.trim())
      setReplyToReplyPosted(true)
      setReplyToReplyText('')
      setTimeout(() => {
        setActiveReplyId(null)
        setReplyToReplyPosted(false)
        setReplyToReplyText('')
      }, 800)
    } catch {
    } finally {
      setReplyToReplySending(false)
    }
  }

  return (
    <Link
      href={`/community?discussion=${id}`}
      className={cn(
        'block bg-white rounded-2xl border border-neutral-200 p-4 md:p-5 transition-all',
        !isExpanded && 'hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200/60',
        isExpanded && 'bg-yellow-50 border-2 border-yellow-300 shadow-md',
        className
      )}
      onClick={(e) => {
        if (window.innerWidth < 1024) {
          if (onMobileClick) {
            e.preventDefault()
            onMobileClick(id)
          }
        } else if (onDesktopClick) {
          e.preventDefault()
          onDesktopClick(id)
        }
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <h3 className="font-bold text-neutral-900 flex-1 leading-snug">{title}</h3>
        <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform duration-300 lg:hidden ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      <div className="flex items-center gap-2 mb-2">
        {categoryName && (
          <span className={cn('px-2 py-0.5 rounded-full border border-primary/30 text-xs font-bold uppercase tracking-tight', categoryColor.bg, categoryColor.text)}>
            {categoryName}
          </span>
        )}
      </div>

      <p className={cn('text-sm text-neutral-500', !isExpanded && 'line-clamp-2')}>{content}</p>

      {isReplying && (
        <form onSubmit={e => { e.preventDefault(); onSubmitReply?.() }} className="mt-3 space-y-2">
          {replyError && <p className="text-xs text-red-600">{replyError}</p>}
          <textarea
            value={replyText}
            onChange={e => onReplyTextChange?.(e.target.value)}
            placeholder="Write a reply..."
            onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
            className="w-full min-h-[80px] rounded-xl border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); onCancelReply?.() }} disabled={sendingReply || replyPosted} className="text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer disabled:cursor-not-allowed">Cancel</button>
            <button type="submit" onClick={(e) => { e.stopPropagation() }} disabled={sendingReply || replyPosted || !replyText?.trim()} className="text-xs font-bold bg-neutral-900 text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {sendingReply ? 'Posting...' : replyPosted ? 'Posted!' : 'Reply'}
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-3">
        <span className="font-medium text-neutral-600">{authorName}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(createdAt).toLocaleDateString('en-US')}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {upvotes}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsDown className="h-3 w-3" />
          {downvotes}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {commentCount}
        </span>
      </div>

      {isExpanded && (
        <div onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 pt-3 border-t border-yellow-200 mt-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onVote?.(id, 1)
              }}
              className={cn(
                'inline-flex items-center gap-1 text-neutral-400 transition-colors hover:text-blue-600',
                userVote === 1 && 'text-blue-600'
              )}
            >
              <ThumbsUp className={`h-4 w-4 ${userVote === 1 ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold">{upvotes}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onVote?.(id, -1)
              }}
              className={cn(
                'inline-flex items-center gap-1 text-neutral-400 transition-colors hover:text-red-500',
                userVote === -1 && 'text-red-500'
              )}
            >
              <ThumbsDown className={`h-4 w-4 ${userVote === -1 ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold">{downvotes}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onReply?.()
              }}
              className="text-neutral-400 transition-colors hover:text-blue-600 cursor-pointer"
            >
              Reply
            </button>
          </div>

          {replies && replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {replies.slice(0, 3).map((reply) => (
                <div key={reply.id} className="rounded-xl bg-white border border-yellow-200 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-neutral-700">{reply.author?.full_name || 'Anonymous'}</span>
                    <span className="text-[10px] text-neutral-400">{new Date(reply.created_at).toLocaleDateString('en-US')}</span>
                  </div>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap break-words">{reply.content}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancelReply?.(); setActiveReplyId(prev => prev === reply.id ? null : reply.id); setReplyToReplyText(''); setReplyToReplyPosted(false) }}
                    className="mt-2 text-xs font-bold text-neutral-500 hover:text-blue-600 cursor-pointer"
                  >
                    {activeReplyId === reply.id ? 'Cancel' : 'Reply'}
                  </button>
                  {activeReplyId === reply.id && (
                    <form
                      onSubmit={(e) => { e.preventDefault(); submitReplyToReply(reply.id) }}
                      className="mt-2 space-y-2"
                    >
                      <textarea
                        value={replyToReplyText}
                        onChange={(e) => setReplyToReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        onClick={(e) => { e.stopPropagation(); e.preventDefault() }}
                        className="w-full min-h-[60px] rounded-xl border border-neutral-200 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button type="submit" onClick={(e) => { e.stopPropagation() }} disabled={replyToReplySending || replyToReplyPosted || !replyToReplyText.trim()} className="text-xs font-bold bg-neutral-900 text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                          {replyToReplySending ? 'Posting...' : replyToReplyPosted ? 'Posted!' : 'Reply'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
              {replies.length > 3 && (
                <p className="text-xs text-neutral-400 text-center pt-1">+{replies.length - 3} more replies</p>
              )}
            </div>
          )}
        </div>
      )}
    </Link>
  )
}
