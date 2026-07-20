'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Plus } from 'lucide-react'

export function NewTopicModal({ isOpen, onClose, forumId }: { isOpen: boolean; onClose: () => void; forumId: string }) {
  const router = useRouter()
  const [title, setTitle] = React.useState('')
  const [content, setContent] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const reset = React.useCallback(() => {
    setTitle('')
    setContent('')
    setSubmitting(false)
    setError(null)
  }, [])

  const handleClose = React.useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Please sign in to create a topic.')
        setSubmitting(false)
        return
      }

      const { data: topic, error: insertError } = await supabase
        .from('forum_topics')
        .insert({
          forum_id: forumId,
          user_id: user.id,
          title,
          content,
        })
        .select('id')
        .single()

      if (insertError || !topic) {
        setError(insertError?.message || 'Failed to create topic.')
        setSubmitting(false)
        return
      }

      router.push(`/forums/${forumId}/${topic.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">New Topic</h2>
              <p className="text-xs text-neutral-500">Start a new discussion</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or insights..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-tight hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Topic'}
          </button>
        </form>
      </div>
    </div>
  )
}
