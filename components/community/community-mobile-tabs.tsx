'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DiscussionCard } from '@/components/ui/discussion-card'
import { MessageCircle, Plus } from 'lucide-react'
import { CommunityCreateModal } from '@/components/community/community-create-modal'
import type { Discussion, DiscussionReply } from '@/types'
import { CommunityService } from '@/services/community-service'

interface CommunityMobileTabsProps {
  discussions: Discussion[]
  userId?: string | null
}

export function CommunityMobileTabs({ discussions, userId }: CommunityMobileTabsProps) {
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [replyingId, setReplyingId] = React.useState<string | null>(null)
  const [discussionsState, setDiscussionsState] = React.useState<Discussion[]>(discussions || [])
  const [replyTexts, setReplyTexts] = React.useState<Record<string, string>>({})
  const [sendingReplies, setSendingReplies] = React.useState<Record<string, boolean>>({})
  const [replyPosted, setReplyPosted] = React.useState<Record<string, boolean>>({})
  const [replyErrors, setReplyErrors] = React.useState<Record<string, string | null>>({})
  const [repliesByDiscussion, setRepliesByDiscussion] = React.useState<Record<string, DiscussionReply[]>>({})

  React.useEffect(() => {
    setDiscussionsState(discussions || [])
  }, [discussions])

  const trendingDiscussions = (discussionsState || []).slice(0, 5)

  const handleMobileClick = React.useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
    if (expandedId === id) {
      setReplyingId(null)
      return
    }
    if (!repliesByDiscussion[id]) {
      CommunityService.getReplies(id)
        .then((data) => {
          setRepliesByDiscussion(prev => ({ ...prev, [id]: (data || []) as DiscussionReply[] }))
        })
        .catch(() => {
          setRepliesByDiscussion(prev => ({ ...prev, [id]: [] }))
        })
    }
  }, [expandedId, repliesByDiscussion])

  const handleVote = React.useCallback(async (id: string, voteType: 1 | -1) => {
    if (!userId) return
    const discussion = discussionsState.find(d => d.id === id)
    if (!discussion) return

    const currentVote = discussion.user_vote
    let newUpvotes = discussion.upvotes || 0
    let newDownvotes = discussion.downvotes || 0
    let newUserVote: number | null = null

    if (currentVote === voteType) {
      newUserVote = null
      if (voteType === 1) newUpvotes -= 1
      else newDownvotes -= 1
    } else {
      newUserVote = voteType
      if (currentVote === 1) newUpvotes -= 1
      if (currentVote === -1) newDownvotes -= 1
      if (voteType === 1) newUpvotes += 1
      else newDownvotes += 1
    }

    setDiscussionsState(prev =>
      prev.map(d => d.id === id ? { ...d, upvotes: newUpvotes, downvotes: newDownvotes, user_vote: newUserVote } : d)
    )

    try {
      await fetch(`/api/community/discussion/${id}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      })
    } catch {
      setDiscussionsState(prev =>
        prev.map(d => d.id === id ? { ...d, upvotes: discussion.upvotes || 0, downvotes: discussion.downvotes || 0, user_vote: discussion.user_vote } : d)
      )
    }
  }, [userId, discussionsState])

  const handleStartReply = React.useCallback((id: string) => {
    setReplyingId(id)
    setReplyTexts(prev => ({ ...prev, [id]: '' }))
    setReplyErrors(prev => ({ ...prev, [id]: null }))
    setReplyPosted(prev => ({ ...prev, [id]: false }))
  }, [])

  const handleCancelReply = React.useCallback((id: string) => {
    setReplyingId(null)
    setReplyTexts(prev => ({ ...prev, [id]: '' }))
    setReplyErrors(prev => ({ ...prev, [id]: null }))
    setReplyPosted(prev => ({ ...prev, [id]: false }))
  }, [])

  const handleReplyToReply = React.useCallback(async (replyId: string, content: string) => {
    if (!userId || !expandedId) return
    const newReply = await CommunityService.addReply(expandedId, content, userId, replyId)
    setDiscussionsState(prev =>
      prev.map(d => d.id === expandedId ? { ...d, reply_count: (d.reply_count || 0) + 1 } : d)
    )
    if (newReply) {
      const replyWithAuthor = { ...(newReply as DiscussionReply), author: undefined } as DiscussionReply
      setRepliesByDiscussion(prev => ({
        ...prev,
        [expandedId]: [...(prev[expandedId] || []), replyWithAuthor],
      }))
    }
  }, [userId, expandedId])

  const handleSubmitReply = React.useCallback(async (id: string) => {
    const text = replyTexts[id]?.trim()
    if (!text || !userId) return

    setSendingReplies(prev => ({ ...prev, [id]: true }))
    setReplyErrors(prev => ({ ...prev, [id]: null }))

    try {
      const newReply = await CommunityService.addReply(id, text, userId)
      setReplyPosted(prev => ({ ...prev, [id]: true }))
      setDiscussionsState(prev =>
        prev.map(d => d.id === id ? { ...d, reply_count: (d.reply_count || 0) + 1 } : d)
      )
      if (newReply) {
        const replyWithAuthor = { ...(newReply as DiscussionReply), author: undefined } as DiscussionReply
        setRepliesByDiscussion(prev => ({
          ...prev,
          [id]: [...(prev[id] || []), replyWithAuthor],
        }))
      }
      setTimeout(() => {
        setReplyTexts(prev => ({ ...prev, [id]: '' }))
        setReplyingId(null)
        setReplyPosted(prev => ({ ...prev, [id]: false }))
        setReplyErrors(prev => ({ ...prev, [id]: null }))
      }, 800)
    } catch {
      setReplyErrors(prev => ({ ...prev, [id]: 'Failed to post reply.' }))
    } finally {
      setSendingReplies(prev => ({ ...prev, [id]: false }))
    }
  }, [userId, replyTexts])

  return (
    <div className="lg:hidden">
      <div className="px-4 sm:px-6 py-4">
        <div className="space-y-4">
          {trendingDiscussions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
              <MessageCircle className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">No discussions yet</p>
              <Link href="/community/ask">
                <Button className="mt-4 rounded-full font-bold">Start a Discussion</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {trendingDiscussions.map((discussion) => (
                <DiscussionCard
                  key={discussion.id}
                  id={discussion.id}
                  title={discussion.title}
                  content={discussion.content}
                  authorName={discussion.author?.full_name || 'Anonymous'}
                  createdAt={discussion.created_at}
                  upvotes={discussion.upvotes}
                  downvotes={discussion.downvotes}
                  userVote={discussion.user_vote}
                  commentCount={discussion.reply_count || 0}
                  categoryName={discussion.category?.name}
                  replies={repliesByDiscussion[discussion.id]}
                  isExpanded={expandedId === discussion.id}
                  onMobileClick={handleMobileClick}
                  onVote={handleVote}
                  onReply={() => handleStartReply(discussion.id)}
                  isReplying={replyingId === discussion.id}
                  replyText={replyTexts[discussion.id] || ''}
                  onReplyTextChange={(text) => setReplyTexts(prev => ({ ...prev, [discussion.id]: text }))}
                  onCancelReply={() => handleCancelReply(discussion.id)}
                  onSubmitReply={() => handleSubmitReply(discussion.id)}
                  sendingReply={sendingReplies[discussion.id] || false}
                  replyPosted={replyPosted[discussion.id] || false}
                  replyError={replyErrors[discussion.id] || null}
                  onReplyToReply={handleReplyToReply}
                />
              ))}
            </div>
          )}
        </div>

        {userId && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="fixed bottom-20 right-5 h-10 w-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-40 lg:hidden"
            aria-label="Create"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}

        <CommunityCreateModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      </div>
    </div>
  )
}
