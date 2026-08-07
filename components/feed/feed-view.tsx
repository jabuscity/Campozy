'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, X, Send, ThumbsUp, ThumbsDown, MessageSquare, CalendarDays, Zap } from 'lucide-react'
import type { CommunityPost, PostComment, Profile } from '@/types'

interface FeedViewProps {
  initialPosts: CommunityPost[]
  currentUser: Profile | null
}

export function FeedView({ initialPosts, currentUser }: FeedViewProps) {
  const [posts, setPosts] = React.useState<CommunityPost[]>(initialPosts || [])
  const [selectedPost, setSelectedPost] = React.useState<CommunityPost | null>(null)
  const [comments, setComments] = React.useState<PostComment[]>([])
  const [postDetailCache, setPostDetailCache] = React.useState<Record<string, { post: CommunityPost; comments: PostComment[] }>>({})

  // Create post form state
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [postTitle, setPostTitle] = React.useState('')
  const [postContent, setPostContent] = React.useState('')
  const [postImage, setPostImage] = React.useState<File | null>(null)
  const [postImageUrl, setPostImageUrl] = React.useState<string | null>(null)
  const [submittingPost, setSubmittingPost] = React.useState(false)
  const [postError, setPostError] = React.useState<string | null>(null)

  // Comment state
  const [commentText, setCommentText] = React.useState('')
  const [submittingComment, setSubmittingComment] = React.useState(false)
  const [commentError, setCommentError] = React.useState<string | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadPostDetail = React.useCallback(async (post: CommunityPost) => {
    if (postDetailCache[post.id]) {
      setSelectedPost(postDetailCache[post.id].post)
      setComments(postDetailCache[post.id].comments)
      return
    }

    try {
      const res = await fetch(`/api/feed/posts/${post.id}`)
      const data = await res.json()
      if (res.ok) {
        setPostDetailCache(prev => ({
          ...prev,
          [post.id]: { post: data.post, comments: data.comments || [] }
        }))
        setSelectedPost(data.post)
        setComments(data.comments || [])
      }
    } catch {
      setSelectedPost(post)
      setComments([])
    }
  }, [postDetailCache])

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser || !postTitle.trim() || !postContent.trim()) return

    setSubmittingPost(true)
    setPostError(null)

    try {
      const body: { title: string; content: string; imageUrl?: string } = { title: postTitle, content: postContent }

      if (postImage) {
        const formData = new FormData()
        formData.append('file', postImage)
        formData.append('bucket', 'post_images')

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

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
        setPostTitle('')
        setPostContent('')
        setPostImage(null)
        setPostImageUrl(null)
        setShowCreateForm(false)
        setSelectedPost(null)
        window.location.reload()
      }
    } catch {
      setPostError('Something went wrong. Please try again.')
    } finally {
      setSubmittingPost(false)
    }
  }

  async function handleVote(voteType: 1 | -1) {
    if (!selectedPost) return
    const res = await fetch(`/api/feed/posts/${selectedPost.id}/vote`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType }),
    })

    if (res.ok) {
      setPosts(prev => prev.map(p => {
        if (p.id !== selectedPost.id) return p
        const currentVote = p.user_vote
        let newVoteCount = p.vote_count || 0
        let newUserVote: number | null = voteType

        if (currentVote === voteType) {
          newVoteCount -= voteType
          newUserVote = null
        } else {
          if (currentVote) newVoteCount -= currentVote
          newVoteCount += voteType
        }

        return { ...p, vote_count: newVoteCount, user_vote: newUserVote }
      }))

      if (selectedPost) {
        const currentVote = selectedPost.user_vote
        let newVoteCount = selectedPost.vote_count || 0
        let newUserVote: number | null = voteType

        if (currentVote === voteType) {
          newVoteCount -= voteType
          newUserVote = null
        } else {
          if (currentVote) newVoteCount -= currentVote
          newVoteCount += voteType
        }

        setSelectedPost({ ...selectedPost, vote_count: newVoteCount, user_vote: newUserVote })
      }
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPost || !currentUser || !commentText.trim()) return

    setSubmittingComment(true)
    setCommentError(null)

    try {
      const res = await fetch(`/api/feed/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setCommentError(data.error || 'Failed to add comment.')
      } else {
        const newComment = {
          id: crypto.randomUUID(),
          post_id: selectedPost.id,
          user_id: currentUser.id,
          content: commentText.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: currentUser,
        }
        setComments(prev => [...prev, newComment as PostComment])
        setCommentText('')
        setSelectedPost(prev => prev ? { ...prev, comment_count: (prev.comment_count || 0) + 1 } : prev)
        setPosts(prev => prev.map(p => {
          if (p.id !== selectedPost.id) return p
          return { ...p, comment_count: (p.comment_count || 0) + 1 }
        }))
      }
    } catch {
      setCommentError('Something went wrong. Please try again.')
    } finally {
      setSubmittingComment(false)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPostImage(file)
      const url = URL.createObjectURL(file)
      setPostImageUrl(url)
    }
  }

  function clearImage() {
    setPostImage(null)
    setPostImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Your Feed
          </h1>
          <p className="text-neutral-600 mt-2">
            Discussions, reports, opportunities, and updates from your campus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left pane: post list */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-8 space-y-3">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
                  <Zap className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">No posts yet</p>
                </div>
              ) : (
                posts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => loadPostDetail(post)}
                    className={`w-full text-left bg-white border rounded-xl p-4 hover:shadow-md transition-all ${
                      selectedPost?.id === post.id
                        ? 'border-primary shadow-md'
                        : 'border-neutral-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-neutral-900 text-sm line-clamp-1 mb-1">{post.title}</h3>
                        <p className="text-xs text-neutral-500 line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-neutral-400">
                          <span className="inline-flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {post.vote_count || 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.comment_count || 0}
                          </span>
                          <span>{new Date(post.created_at).toLocaleDateString('en-US')}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right pane: post detail or create form */}
          <div className="lg:col-span-8">
            {selectedPost ? (
              <PostDetailView
                post={selectedPost}
                comments={comments}
                currentUser={currentUser}
                onVote={handleVote}
                onAddComment={handleAddComment}
                commentText={commentText}
                setCommentText={setCommentText}
                submittingComment={submittingComment}
                commentError={commentError}
                onBack={() => setSelectedPost(null)}
              />
            ) : (
              <div className="space-y-4">
                {/* Create post form */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
                  {currentUser ? (
                    showCreateForm ? (
                      <form onSubmit={handleCreatePost} className="space-y-4">
                        {postError && (
                          <p className="text-xs font-medium text-red-600">{postError}</p>
                        )}
                        <input
                          type="text"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="Title"
                          required
                          className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder="What's on your mind?"
                          rows={5}
                          required
                          className="w-full px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        />
                        {postImageUrl && (
                          <div className="relative">
                            <img
                              src={postImageUrl}
                              alt="Post preview"
                              className="max-h-48 w-full object-cover rounded-xl border border-neutral-200"
                            />
                            <button
                              type="button"
                              onClick={clearImage}
                              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-neutral-800/50 text-white flex items-center justify-center hover:bg-neutral-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
                              <Upload className="h-4 w-4" />
                              <span>Add Image</span>
                              <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowCreateForm(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" size="sm" className="font-bold" disabled={submittingPost}>
                              {submittingPost ? 'Posting...' : 'Post'}
                            </Button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="w-full text-left flex items-center gap-3 text-neutral-400 hover:text-neutral-700 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                          <Upload className="h-5 w-5" />
                        </div>
                        <span className="font-medium">Share an update... (text, image, or both)</span>
                      </button>
                    )
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <p className="text-sm">Sign in to post on the feed.</p>
                    </div>
                  )}
                </div>

                {/* Stats summary when no post selected */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                    <div className="text-2xl font-black text-primary">{posts.length}</div>
                    <div className="text-xs text-neutral-500">Posts</div>
                  </div>
                  <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                    <div className="text-2xl font-black text-primary">
                      {posts.reduce((sum, p) => sum + (p.comment_count || 0), 0)}
                    </div>
                    <div className="text-xs text-neutral-500">Comments</div>
                  </div>
                  <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                    <div className="text-2xl font-black text-primary">
                      {posts.reduce((sum, p) => sum + Math.abs(p.vote_count || 0), 0)}
                    </div>
                    <div className="text-xs text-neutral-500">Votes</div>
                  </div>
                  <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                    <div className="text-2xl font-black text-primary">
                      {currentUser ? 'Active' : 'Guest'}
                    </div>
                    <div className="text-xs text-neutral-500">Status</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface PostDetailViewProps {
  post: CommunityPost
  comments: PostComment[]
  currentUser: Profile | null
  onVote: (voteType: 1 | -1) => void
  onAddComment: (e: React.FormEvent) => void
  commentText: string
  setCommentText: (value: string) => void
  submittingComment: boolean
  commentError: string | null
  onBack: () => void
}

function PostDetailView({
  post,
  comments,
  currentUser,
  onVote,
  onAddComment,
  commentText,
  setCommentText,
  submittingComment,
  commentError,
  onBack,
}: PostDetailViewProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-black text-neutral-900">Post Detail</h2>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-neutral-900 mb-2">{post.title}</h3>
          <p className="text-neutral-500 text-xs mb-2">
            {post.author?.full_name || post.author?.username || 'Anonymous'} • {new Date(post.created_at).toLocaleDateString('en-US')}
          </p>
          <p className="text-neutral-700 whitespace-pre-wrap mb-4">{post.content}</p>
          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="max-h-80 w-full object-cover rounded-xl border border-neutral-200 mb-4"
            />
          )}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onVote(1)}
              className={`flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors ${
                post.user_vote === 1 ? 'text-primary' : ''
              }`}
            >
              <ThumbsUp className={`h-5 w-5 ${post.user_vote === 1 ? 'fill-current' : ''}`} />
              <span className="font-bold">{post.vote_count || 0}</span>
            </button>
            <button
              onClick={() => onVote(-1)}
              className={`flex items-center gap-2 text-neutral-600 hover:text-red-500 transition-colors ${
                post.user_vote === -1 ? 'text-red-500' : ''
              }`}
            >
              <ThumbsDown className={`h-5 w-5 ${post.user_vote === -1 ? 'fill-current' : ''}`} />
            </button>
            <span className="text-xs text-neutral-400">
              {post.comment_count || 0} comments
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-3">
          Comments
        </h4>
        {comments.length === 0 ? (
          <p className="text-neutral-500 text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-3 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 flex-shrink-0">
                  <span className="text-xs font-bold">
                    {(comment.author?.full_name || comment.author?.username || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-400 mb-1">
                    {comment.author?.full_name || comment.author?.username || 'Anonymous'} • {new Date(comment.created_at).toLocaleDateString('en-US')}
                  </p>
                  <p className="text-sm text-neutral-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentUser ? (
          <form onSubmit={onAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 h-9 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
            <Button type="submit" size="sm" className="font-bold" disabled={submittingComment}>
              {submittingComment ? '...' : <Send className="h-4 w-4" />}
            </Button>
          </form>
        ) : (
          <p className="text-xs text-neutral-400">Sign in to comment.</p>
        )}
        {commentError && (
          <p className="text-xs font-medium text-red-600 mt-1">{commentError}</p>
        )}
      </div>
    </div>
  )
}
