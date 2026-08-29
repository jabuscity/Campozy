'use client'

import * as React from 'react'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Upload, X, ThumbsUp, Zap } from 'lucide-react'
import type { CommunityPost, Profile } from '@/types'

interface FeedViewProps {
  initialPosts: CommunityPost[]
  currentUser: Profile | null
  stats: {
    totalPosts: number
    totalComments: number
    positiveVotes: number
    negativeVotes: number
  }
  isPremium: boolean
}

function FeedPostCard({
  post,
  onVote,
  isReplying,
  replyText,
  replyError,
  replyPosted,
  onReplyTextChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  sendingReply,
}: {
  post: CommunityPost
  onVote: (postId: string) => void
  isReplying: boolean
  replyText: string
  replyError: string | null
  replyPosted: boolean
  onReplyTextChange: (text: string) => void
  onStartReply: () => void
  onCancelReply: () => void
  onSubmitReply: () => void
  sendingReply: boolean
}) {
  const authorName = post.author?.full_name || post.author?.username || 'Anonymous'
  const dateStr = new Date(post.created_at).toLocaleDateString('en-US')
  const upvotes = post.upvotes || 0

  if (post.image_url) {
    return (
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[16/9] bg-neutral-900 transition-shadow duration-300 hover:shadow-lg hover:shadow-blue-500/20">
        <img
          src={post.image_url}
          alt="Post"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt={authorName} className="h-7 w-7 rounded-full object-cover border border-white/30 flex-shrink-0" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                <Zap className="h-3.5 w-3.5" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold leading-tight">{authorName}</p>
              <p className="text-[11px] text-white/70 leading-tight">{dateStr}</p>
            </div>
          </div>
          {post.content && (
            <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed line-clamp-3 mb-3">{post.content}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-white/80">
            <button
              type="button"
              onClick={() => onVote(post.id)}
              className="inline-flex items-center gap-1 text-white/70 transition-colors hover:text-white"
            >
              <ThumbsUp className={`h-4 w-4 ${post.user_vote === 1 ? 'fill-current text-blue-300' : ''}`} />
              {upvotes}
            </button>
            <button
              type="button"
              onClick={onStartReply}
              className="text-white/70 transition-colors hover:text-white"
            >
              Reply
            </button>
          </div>
          {isReplying && (
            <form onSubmit={e => { e.preventDefault(); onSubmitReply() }} className="mt-3 space-y-2">
              {replyError && <p className="text-xs text-red-300">{replyError}</p>}
              <textarea
                value={replyText}
                onChange={e => onReplyTextChange(e.target.value)}
                placeholder="Write a reply..."
                className="w-full min-h-[80px] rounded-xl border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={onCancelReply} disabled={sendingReply || replyPosted} className="text-xs text-white/70 hover:text-white">Cancel</button>
                <button type="submit" disabled={sendingReply || replyPosted || !replyText.trim()} className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-white/90 disabled:opacity-50">
                  {sendingReply ? 'Posting...' : replyPosted ? 'Posted!' : 'Reply'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-5 transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200/60">
      <div className="flex items-start gap-2.5 mb-2">
        {post.author?.avatar_url ? (
          <img src={post.author.avatar_url} alt={authorName} className="h-7 w-7 rounded-full object-cover border border-neutral-200 flex-shrink-0" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Zap className="h-3.5 w-3.5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-neutral-900">
            {authorName}
          </p>
          <p className="text-[11px] text-neutral-400">{dateStr}</p>
        </div>
      </div>
      <p className="text-sm text-neutral-900 whitespace-pre-wrap mb-3 leading-relaxed">{post.content}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-2">
        <button
          type="button"
          onClick={() => onVote(post.id)}
          className="inline-flex items-center gap-1 text-neutral-400 transition-colors hover:text-blue-600"
        >
          <ThumbsUp className={`h-4 w-4 ${post.user_vote === 1 ? 'fill-current text-blue-600' : ''}`} />
          {upvotes}
        </button>
        <button
          type="button"
          onClick={onStartReply}
          className="text-neutral-400 transition-colors hover:text-blue-600"
        >
          Reply
        </button>
      </div>
      {isReplying && (
        <form onSubmit={e => { e.preventDefault(); onSubmitReply() }} className="mt-2 space-y-2">
          {replyError && <p className="text-xs text-red-600">{replyError}</p>}
          <textarea
            value={replyText}
            onChange={e => onReplyTextChange(e.target.value)}
            placeholder="Write a reply..."
            className="w-full min-h-[80px] rounded-xl border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onCancelReply} disabled={sendingReply || replyPosted} className="text-xs text-neutral-500 hover:text-neutral-900">Cancel</button>
            <button type="submit" disabled={sendingReply || replyPosted || !replyText.trim()} className="text-xs font-bold bg-neutral-900 text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-50">
              {sendingReply ? 'Posting...' : replyPosted ? 'Posted!' : 'Reply'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export function FeedView({ initialPosts, currentUser }: FeedViewProps) {
  const [posts, setPosts] = React.useState<CommunityPost[]>(initialPosts || [])
  const [postContent, setPostContent] = React.useState('')
  const [postImage, setPostImage] = React.useState<File | null>(null)
  const [postImageUrl, setPostImageUrl] = React.useState<string | null>(null)
  const [submittingPost, setSubmittingPost] = React.useState(false)
  const [postError, setPostError] = React.useState<string | null>(null)

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser || !postContent.trim()) return

    setSubmittingPost(true)
    setPostError(null)

    try {
      const body: { content: string; imageUrl?: string; title?: string | null } = { content: postContent }

      if (postImage) {
        const formData = new FormData()
        formData.append('file', postImage)
        formData.append('bucket', 'post_images')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          setPostError(uploadData.error || 'Image upload failed.')
          setSubmittingPost(false)
          return
        }
        body.imageUrl = uploadData.url
      }

      const res = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setPostError(data.error || 'Failed to create post.')
      } else {
        if (postImageUrl) URL.revokeObjectURL(postImageUrl)
        setPostContent('')
        setPostImage(null)
        setPostImageUrl(null)
        if (data.post) {
          setPosts(prev => [data.post, ...prev])
        } else {
          const freshRes = await fetch('/api/feed/posts')
          const freshData = await freshRes.json()
          if (freshRes.ok && freshData.posts) {
            setPosts(freshData.posts)
          }
        }
      }
    } catch {
      setPostError('Something went wrong. Please try again.')
    } finally {
      setSubmittingPost(false)
    }
  }

  async function handleVote(postId: string) {
    const originalPost = posts.find(p => p.id === postId)

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p
        const currentVote = p.user_vote
        let newUpvotes = p.upvotes || 0
        let newDownvotes = p.downvotes || 0
        let newVoteCount = p.vote_count || 0
        let newUserVote: number | null = null
        if (currentVote === 1) {
          newUpvotes -= 1
          newVoteCount -= 1
          newUserVote = null
        } else {
          newUpvotes += 1
          newUserVote = 1
          if (currentVote === -1) {
            newDownvotes -= 1
            newVoteCount += 1
          }
          newVoteCount += 1
        }
        return { ...p, upvotes: newUpvotes, downvotes: newDownvotes, vote_count: newVoteCount, user_vote: newUserVote }
      }),
    )

    try {
      const res = await fetch(`/api/feed/posts/${postId}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: 1 }),
      })

      if (!res.ok && originalPost) {
        setPosts(prev => prev.map(p => p.id === postId ? originalPost : p))
      }
    } catch {
      if (originalPost) {
        setPosts(prev => prev.map(p => p.id === postId ? originalPost : p))
      }
    }
  }

  const [activeReplyId, setActiveReplyId] = React.useState<string | null>(null)
  const [replyText, setReplyText] = React.useState('')
  const [sendingReply, setSendingReply] = React.useState(false)
  const [replyPosted, setReplyPosted] = React.useState(false)
  const [replyError, setReplyError] = React.useState<string | null>(null)

  async function handleSubmitReply(postId: string) {
    if (!replyText.trim()) return
    setSendingReply(true)
    setReplyError(null)
    try {
      const res = await fetch(`/api/feed/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim() }),
      })
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
        setReplyPosted(true)
        setTimeout(() => {
          setReplyText('')
          setActiveReplyId(null)
          setReplyPosted(false)
          setReplyError(null)
        }, 800)
      } else {
        const data = await res.json().catch(() => ({}))
        setReplyError(data.error || 'Failed to post reply.')
      }
    } finally {
      setSendingReply(false)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const compressed = async () => {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        })
        setPostImage(compressedFile)
        setPostImageUrl(URL.createObjectURL(compressedFile))
      } catch {
        setPostImage(file)
        setPostImageUrl(URL.createObjectURL(file))
      }
    }
    compressed()
  }

  function clearImage() {
    if (postImageUrl) URL.revokeObjectURL(postImageUrl)
    setPostImage(null)
    setPostImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null)

   return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 md:py-10">
        <p className="text-neutral-600 font-bold mb-5">What&apos;s on your mind?</p>
        <div className="bg-secondary/10 rounded-2xl border border-secondary/20 overflow-hidden mb-5 px-3 md:px-4 pt-3 md:pt-4 pb-2">
          <form onSubmit={handleCreatePost}>
            {postError && <p className="text-xs font-medium text-red-600 px-3 pt-3">{postError}</p>}

            {postImageUrl ? (
              <div className="relative">
                <img
                  src={postImageUrl}
                  alt="Post preview"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                {currentUser && (
                  <div className="absolute inset-x-0 top-0 p-3 flex items-center gap-2">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.full_name || currentUser.username || 'Anonymous'} className="h-7 w-7 rounded-full object-cover border border-white/30 flex-shrink-0" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                        <Zap className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <p className="text-xs font-bold text-white">
                      {currentUser.full_name || currentUser.username || 'Anonymous'}
                    </p>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <textarea
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    placeholder="Write something about this photo..."
                    rows={2}
                    required
                    className="w-full bg-transparent text-white placeholder:text-white/60 text-sm font-medium focus:outline-none resize-none mb-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {currentUser && (
                  <div className="flex items-center gap-2.5">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.full_name || currentUser.username || 'Anonymous'} className="h-8 w-8 rounded-full object-cover border border-neutral-200 flex-shrink-0" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Zap className="h-4 w-4" />
                      </div>
                    )}
                    <p className="text-sm font-bold text-neutral-900">
                      {currentUser.full_name || currentUser.username || 'Anonymous'}
                    </p>
                  </div>
                )}
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={2}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between px-3 py-2 border-t border-neutral-100 -mt-0.5">
              <label className="cursor-pointer flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <Button type="submit" size="sm" className="font-bold" disabled={submittingPost}>
                {submittingPost ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-neutral-200">
            <Zap className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <FeedPostCard
                key={post.id}
                post={post}
                onVote={handleVote}
                isReplying={activeReplyId === post.id}
                replyText={replyText}
                replyError={replyError}
                replyPosted={replyPosted}
                onReplyTextChange={setReplyText}
                onStartReply={() => setActiveReplyId(post.id)}
                onCancelReply={() => { setActiveReplyId(null); setReplyText(''); setReplyError(null); setReplyPosted(false) }}
                onSubmitReply={() => handleSubmitReply(post.id)}
                sendingReply={sendingReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
