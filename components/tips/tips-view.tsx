'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TipCategory, TipSuggestionWithCategory } from '@/services/tip-service'
import { Plus, X, Check, Trash2, Bell } from 'lucide-react'

interface TipsViewProps {
  categories: TipCategory[]
  approvedTips: TipSuggestionWithCategory[]
  pendingSuggestions: TipSuggestionWithCategory[]
  isAdmin: boolean
  userId: string | null
}

const STATIC_RESOURCES = [
  {
    title: 'Housing Guide',
    description: 'Everything you need to know about finding safe, verified student housing in Kenya.',
    href: '/resources/housing-guide',
    category: 'House Finding',
  },
  {
    title: 'Community Guidelines',
    description: 'How to engage respectfully and safely on Campozy.',
    href: '/resources/community-guidelines',
    category: 'Social',
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step guides for students and campus communities.',
    href: '/resources/tutorials',
    category: 'Academics',
  },
  {
    title: 'External Links',
    description: 'Useful resources from partner institutions and organizations.',
    href: '/resources/external-links',
    category: 'Academics',
  },
]

export function TipsView({
  categories,
  approvedTips,
  pendingSuggestions,
  isAdmin,
  userId,
}: TipsViewProps) {
  const [showSuggest, setShowSuggest] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const tips = approvedTips
  const pending = pendingSuggestions
  const [adminSuggestions, setAdminSuggestions] = React.useState<TipSuggestionWithCategory[]>([])

  const allTips = [...STATIC_RESOURCES.map(r => ({
    category: r.category,
    title: r.title,
    description: r.description,
    href: r.href,
    isStatic: true,
  })), ...tips.map(t => ({
    category: t.category?.name || 'General',
    title: t.title,
    description: t.description,
    href: `/tips/${t.id}`,
    isStatic: false,
  }))]

  const filteredTips = selectedCategory === 'all'
    ? allTips
    : allTips.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase())

  const displayPending = pending.filter(s => s.user_id === userId)

  async function handleSuggest(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    const categoryId = categories.find(c => c.name === selectedCategory)?.id
    if (!categoryId) {
      setSubmitError('Please select a category.')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, title, description }),
      })

      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit suggestion.')
      } else {
        setSubmitSuccess(true)
        setShowSuggest(false)
        setTitle('')
        setDescription('')
        setSelectedCategory('Budgeting')
        window.location.reload()
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleApprove(id: string) {
    const res = await fetch(`/api/tips/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })
    if (res.ok) {
      setAdminSuggestions(prev => prev.filter(s => s.id !== id))
    }
  }

  async function handleReject(id: string, reason: string) {
    const res = await fetch(`/api/tips/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
    })
    if (res.ok) {
      setAdminSuggestions(prev => prev.filter(s => s.id !== id))
    }
  }

  React.useEffect(() => {
    if (isAdmin) {
      fetch('/api/tips/suggestions')
        .then(r => r.json())
        .then(data => {
          if (data.suggestions) {
            setAdminSuggestions(data.suggestions)
          }
        })
        .catch(() => {})
    }
  }, [isAdmin])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <Link href="/" className="fixed top-8 left-8 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeftIcon className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💡</div>
          <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight">Tips &amp; Tricks</h1>
          <p className="text-neutral-500">Guides, tutorials, and tools to help you make the most of Campozy.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat.name
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {userId && (
          <div className="mb-6 flex items-center gap-3">
            <Button
              onClick={() => setShowSuggest(true)}
              variant="outline"
              className="rounded-full font-bold border-2 border-neutral-200 hover:border-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Suggest a Tip
            </Button>
            {displayPending.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                <Bell className="h-3 w-3" />
                {displayPending.length} pending
              </span>
            )}
          </div>
        )}

        {displayPending.length > 0 && userId && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-3">Your Suggestions (Pending)</h3>
            <div className="space-y-3">
              {displayPending.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-neutral-100 border border-neutral-200 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-400">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-neutral-900">{s.title}</h4>
                        <span className="px-2 py-0.5 text-xs font-black text-amber-800 bg-amber-100 rounded-full">
                          PENDING
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 line-clamp-2">{s.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {filteredTips.map((tip, idx) => {
            const isStatic = idx < STATIC_RESOURCES.length
            return (
              <Link
                key={tip.href}
                href={tip.href}
                className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:shadow-lg transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {isStatic ? (
                    <BookOpenIcon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold text-primary">{tip.category?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-neutral-900 group-hover:text-primary transition-colors">{tip.title}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2">{tip.description}</p>
                </div>

                {!isStatic && tip.category && (
                  <span className="text-xs font-bold text-neutral-400 uppercase">
                    {tip.category}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {isAdmin && adminSuggestions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4">
              Pending Suggestions (Admin)
            </h3>
            <div className="space-y-4">
              {adminSuggestions.map(s => (
                <AdminSuggestionCard
                  key={s.id}
                  suggestion={s}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center mb-6">
            <p className="text-sm font-medium text-green-800">
              Your suggestion has been submitted and is awaiting admin review!
            </p>
          </div>
        )}

      </div>

      {showSuggest && (
        <SuggestForm
          categories={categories}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setShowSuggest(false)}
          onSubmit={handleSuggest}
          selectedCategory={selectedCategory}
          title={title}
          description={description}
          onCategoryChange={setSelectedCategory}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
        />
      )}
    </div>
  )
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0 3 3h1" />
    </svg>
  )
}

interface SuggestFormProps {
  categories: TipCategory[]
  submitting: boolean
  submitError: string | null
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  selectedCategory: string
  title: string
  description: string
  onCategoryChange: (value: string) => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

function SuggestForm({
  categories,
  submitting,
  submitError,
  onClose,
  onSubmit,
  selectedCategory,
  title,
  description,
  onCategoryChange,
  onTitleChange,
  onDescriptionChange,
}: SuggestFormProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <h2 className="text-lg font-black text-neutral-900 uppercase italic">Suggest a Tip</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. How to cook on a budget"
              required
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe the tip in detail..."
              required
              rows={4}
              className="w-full px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {submitError && (
            <p className="text-xs font-medium text-red-600">{submitError}</p>
          )}

          <Button type="submit" className="w-full font-bold" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Suggestion'}
          </Button>
        </form>
      </div>
    </div>
  )
}

interface AdminSuggestionCardProps {
  suggestion: TipSuggestionWithCategory
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}

function AdminSuggestionCard({ suggestion, onApprove, onReject }: AdminSuggestionCardProps) {
  const [showRejectForm, setShowRejectForm] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')

  function handleReject() {
    if (!rejectionReason.trim()) return
    onReject(suggestion.id, rejectionReason)
    setShowRejectForm(false)
    setRejectionReason('')
  }

  return (
    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-black text-neutral-900">{suggestion.title}</h4>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
            suggestion.status === 'pending'
              ? 'bg-amber-100 text-amber-800'
              : suggestion.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {suggestion.status.toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-neutral-400">
          {suggestion.category?.name || 'General'}
        </span>
      </div>

      <p className="text-sm text-neutral-600 mb-4">{suggestion.description}</p>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onApprove(suggestion.id)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold"
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRejectForm(true)}
          className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>

      {showRejectForm && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
          <input
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full px-3 h-9 rounded-lg border border-red-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-200 mb-2"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white font-bold">
              Send Rejection
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowRejectForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
