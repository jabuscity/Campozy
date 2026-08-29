"use client"

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TipCategory, TipSuggestionWithCategory } from '@/services/tip-service'
import { Plus, X, Check, Trash2, Bell, BookOpen, FileText, Video, ExternalLink, ChevronDown, Wallet, Users, GraduationCap, Home, Church, Calendar, ArrowBigUp, ArrowBigDown, type LucideIcon } from 'lucide-react'
import CommunityRailWrapper from '@/components/community/community-rail-wrapper'

interface TipsViewProps {
  categories: TipCategory[]
  approvedTips: TipSuggestionWithCategory[]
  pendingSuggestions: TipSuggestionWithCategory[]
  isAdmin: boolean
  userId: string | null
  variant?: 'full' | 'embedded'
}

const STATIC_RESOURCES = [
  {
    title: 'Housing Guide',
    description: 'Everything you need to know about finding safe, verified student housing in Kenya.',
    href: '/resources/housing-guide',
    category: 'House Finding',
    icon: BookOpen,
  },
  {
    title: 'Community Guidelines',
    description: 'How to engage respectfully and safely on Campozy.',
    href: '/resources/community-guidelines',
    category: 'Social',
    icon: FileText,
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step guides for students and campus communities.',
    href: '/resources/tutorials',
    category: 'Academics',
    icon: Video,
  },
  {
    title: 'External Links',
    description: 'Useful resources from partner institutions and organizations.',
    href: '/resources/external-links',
    category: 'Academics',
    icon: ExternalLink,
  },
]

const TIP_CATEGORY_ICONS: Record<string, LucideIcon> = {
  budgeting: Wallet,
  social: Users,
  academics: GraduationCap,
  'house finding': Home,
  spiritual: Church,
}

export function TipsView({
  categories,
  approvedTips,
  pendingSuggestions,
  isAdmin,
  userId,
  variant = 'full',
}: TipsViewProps) {
  const [showSuggest, setShowSuggest] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'browse' | 'contributions'>('browse')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [customCategoryName, setCustomCategoryName] = React.useState<string>('')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [headerHidden, setHeaderHidden] = React.useState(false)
  const [tipVotes, setTipVotes] = React.useState<Record<string, { upvotes: number; downvotes: number; user_vote: number | null }>>({})

  const handleCardClick = React.useCallback((id: string) => {
    setExpandedId(prev => {
      const next = prev === id ? null : id
      if (next) {
        setTimeout(() => {
          const el = document.getElementById(`tip-card-${id}`)
          if (el) {
            const headerOffset = headerHidden ? 0 : 64
            const filterStrip = document.querySelector('.mobile-opportunity-filters')
            const filterStripHeight = filterStrip ? filterStrip.getBoundingClientRect().height : 0
            const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - headerOffset - (headerHidden ? filterStripHeight : 0) - 16
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
          }
        }, 50)
      }
      return next
    })
  }, [headerHidden])

  const tips = approvedTips
  const pending = pendingSuggestions
  const [adminSuggestions, setAdminSuggestions] = React.useState<TipSuggestionWithCategory[]>([])

  const nonStaticTips = tips

  React.useEffect(() => {
    if (!userId || !nonStaticTips.length) return
    const tipIds = nonStaticTips.map(t => t.id)
    fetch('/api/tips/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipIds, userId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.votes) {
          const voteMap: Record<string, { upvotes: number; downvotes: number; user_vote: number | null }> = {}
          for (const v of data.votes) {
            voteMap[v.tip_id] = {
              upvotes: v.upvotes || 0,
              downvotes: v.downvotes || 0,
              user_vote: v.user_vote || null,
            }
          }
          setTipVotes(voteMap)
        }
      })
      .catch(() => {})
  }, [userId, nonStaticTips])

  async function handleVote(tipId: string, voteType: 1 | -1) {
    if (!userId) return

    const current = tipVotes[tipId] || { upvotes: 0, downvotes: 0, user_vote: null }
    let newUpvotes = current.upvotes
    let newDownvotes = current.downvotes
    let newUserVote: number | null = voteType

    if (current.user_vote === voteType) {
      newUserVote = null
      if (voteType === 1) newUpvotes -= 1
      else newDownvotes -= 1
    } else {
      if (current.user_vote === 1) newUpvotes -= 1
      if (current.user_vote === -1) newDownvotes -= 1
      if (voteType === 1) newUpvotes += 1
      else newDownvotes += 1
    }

    setTipVotes(prev => ({
      ...prev,
      [tipId]: { upvotes: newUpvotes, downvotes: newDownvotes, user_vote: newUserVote },
    }))

    try {
      const res = await fetch(`/api/tips/${tipId}/vote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      })

      if (!res.ok) {
        setTipVotes(prev => {
          const c = prev[tipId] || { upvotes: 0, downvotes: 0, user_vote: null }
          let u = c.upvotes
          let d = c.downvotes
          let uv: number | null = voteType
          if (c.user_vote === voteType) {
            uv = null
            if (voteType === 1) u -= 1
            else d -= 1
          } else {
            if (c.user_vote === 1) u -= 1
            if (c.user_vote === -1) d -= 1
            if (voteType === 1) u += 1
            else d += 1
          }
          return { ...prev, [tipId]: { upvotes: u, downvotes: d, user_vote: uv } }
        })
      }
    } catch {
      setTipVotes(prev => {
        const c = prev[tipId] || { upvotes: 0, downvotes: 0, user_vote: null }
        let u = c.upvotes
        let d = c.downvotes
        let uv: number | null = voteType
        if (c.user_vote === voteType) {
          uv = null
          if (voteType === 1) u -= 1
          else d -= 1
        } else {
          if (c.user_vote === 1) u -= 1
          if (c.user_vote === -1) d -= 1
          if (voteType === 1) u += 1
          else d += 1
        }
        return { ...prev, [tipId]: { upvotes: u, downvotes: d, user_vote: uv } }
      })
    }
  }

  const allTips: { id?: string; created_at?: string; category: string; title: string; description: string; href: string; icon?: LucideIcon; isStatic: boolean; upvotes: number; downvotes: number; user_vote: number | null }[] = [
    ...STATIC_RESOURCES.map(r => ({
      id: undefined,
      created_at: undefined,
      category: r.category,
      title: r.title,
      description: r.description,
      href: r.href,
      icon: r.icon,
      isStatic: true,
      upvotes: 0,
      downvotes: 0,
      user_vote: null,
    })),
    ...tips.map(t => {
      const voteData = tipVotes[t.id] || { upvotes: 0, downvotes: 0, user_vote: null }
      return {
        id: t.id,
        created_at: t.created_at,
        category: t.category?.name || 'General',
        title: t.title,
        description: t.description,
        href: `/tips/${t.id}`,
        icon: undefined,
        isStatic: false,
        upvotes: voteData.upvotes,
        downvotes: voteData.downvotes,
        user_vote: voteData.user_vote,
      }
    }),
  ]

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

    const isOther = selectedCategory.toLowerCase() === 'other'
    const customName = isOther ? customCategoryName.trim() : undefined

    if (isOther && !customName) {
      setSubmitError('Please enter a custom category name.')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, title, description, customCategoryName: customName }),
      })

      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit suggestion.')
      } else {
        setSubmitSuccess(true)
        setShowSuggest(false)
        setTitle('')
        setDescription('')
        setSelectedCategory('all')
        setCustomCategoryName('')
        window.location.reload()
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleApprove(id: string, categoryId?: string, customCategoryName?: string) {
    const res = await fetch(`/api/tips/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', categoryId, customCategoryName }),
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

  React.useEffect(() => {
    function handleScroll() {
      setHeaderHidden(window.scrollY > 64)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div className={variant === 'embedded' ? '' : 'min-h-screen bg-white'}>
        <div className={variant === 'embedded' ? '' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12'}>
          <div className="flex gap-6">
            {/* Left Pane - Desktop Only (reusable rail) */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <CommunityRailWrapper
                activeTab="discussions"
                categories={categories}
                discussions={[]}
                events={[]}
              />
            </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Top Tabs - Desktop only */}
                <div className="hidden lg:flex justify-center mb-6">
                  <div className="inline-flex bg-blue-100 rounded-3xl p-1">
                    <button
                      onClick={() => setActiveTab('browse')}
                      className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'browse'
                          ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      Browse
                    </button>
                  </div>
                </div>

                {/* Browse Content - Always visible on mobile, tab-gated on desktop */}
                <div className={activeTab === 'browse' ? '' : 'hidden'}>
                   <div className="mb-6 md:mb-8">
                     {headerHidden && <div className="lg:hidden h-14" aria-hidden="true" />}
                        <div className={`mobile-opportunity-filters lg:hidden ${headerHidden ? 'fixed top-0 inset-x-0 z-[60] bg-blue-50/90 backdrop-blur-md px-4 pt-3 pb-3 shadow-md' : 'sticky top-16 z-30 bg-neutral-50 mx-4 px-4 pb-3'}`}>
                         <div className="flex w-full">
                           <div className="flex flex-1 items-center justify-between bg-blue-100 rounded-3xl p-1">
                             {categories.map(cat => {
                               const Icon = TIP_CATEGORY_ICONS[cat.name.toLowerCase()] || BookOpen
                               const isActive = selectedCategory === cat.name
                               return (
                                 <button
                                   key={cat.id}
                                   onClick={() => setSelectedCategory(prev => prev === cat.name ? 'all' : cat.name)}
                                   className={`flex flex-1 items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                                     isActive
                                       ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                                       : 'text-neutral-500 hover:text-neutral-700'
                                   }`}
                                 >
                                   <Icon className="h-5 w-5" />
                                 </button>
                               )
                             })}
                           </div>
                         </div>
                       </div>
                      {/* Plus button moved to floating action */}
                    </div>

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
                        const isExpanded = expandedId === tip.href
                        return (
                          <Link
                            key={tip.href}
                            href={tip.href}
                            className="block"
                            id={`tip-card-${tip.href}`}
                            onClick={(e) => {
                              if (window.innerWidth < 1024) {
                                e.preventDefault()
                                handleCardClick(tip.href)
                              }
                            }}
                          >
                            <div className={`rounded-2xl border p-4 transition-all duration-300 ease-in-out h-full ${isExpanded ? 'bg-orange-50 border-orange-200 shadow-md' : 'bg-white border-neutral-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200/60'}`}>
                              <div className="flex items-start gap-3 mb-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                  {isStatic ? (
                                    tip.icon ? <tip.icon className="h-5 w-5" /> : <span />
                                  ) : (
                                    <span className="text-sm font-bold text-primary">{tip.category?.[0]?.toUpperCase()}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-neutral-900">{tip.title}</h3>
                                  <p className="text-sm text-neutral-500 line-clamp-2">{tip.description}</p>
                                </div>
                                <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform duration-300 lg:hidden ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                              
                              {isExpanded && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <p className="text-sm text-neutral-600 leading-relaxed">
                                    {tip.description}
                                  </p>
                                </div>
                              )}
                              
                              {!isExpanded && (
                                 <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
                                  {tip.created_at && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5" />
                                      <span className="font-medium text-neutral-600">{new Date(tip.created_at).toLocaleDateString('en-US')}</span>
                                    </span>
                                  )}
                                  {!isStatic && tip.id && (
                                    <span className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          handleVote(tip.id!, 1)
                                        }}
                                        className={`inline-flex items-center gap-0.5 ${tip.user_vote === 1 ? 'text-green-600' : 'text-neutral-400 hover:text-green-600'}`}
                                        aria-label="Upvote"
                                      >
                                        <ArrowBigUp className={`h-3.5 w-3.5 ${tip.user_vote === 1 ? 'fill-current' : ''}`} />
                                        <span className="font-medium">{tip.upvotes || 0}</span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          handleVote(tip.id!, -1)
                                        }}
                                        className={`inline-flex items-center gap-0.5 ${tip.user_vote === -1 ? 'text-red-500' : 'text-neutral-400 hover:text-red-500'}`}
                                        aria-label="Downvote"
                                      >
                                        <ArrowBigDown className={`h-3.5 w-3.5 ${tip.user_vote === -1 ? 'fill-current' : ''}`} />
                                        <span className="font-medium">{tip.downvotes || 0}</span>
                                      </button>
                                    </span>
                                    )}
                                  {tip.user_vote === 1 && (
                                    <span className="font-medium text-green-600">Helpful</span>
                                  )}
                                  {tip.user_vote === -1 && (
                                    <span className="font-medium text-red-500">Not helpful</span>
                                  )}
                                  {tip.user_vote === null && (
                                    <span className="font-medium text-neutral-600">
                                      {tip.upvotes - tip.downvotes > 0 ? 'Positive' : tip.upvotes - tip.downvotes < 0 ? 'Negative' : 'No votes'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
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
                            categories={categories}
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

            </div>
          </div>
        </div>
      </div>
      {userId && (
        <button
          onClick={() => setShowSuggest(true)}
          className="fixed bottom-20 right-5 h-10 w-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-40 lg:hidden"
          aria-label="Suggest a Tip"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}

      {showSuggest && (
        <SuggestForm
          categories={categories}
          submitting={submitting}
          submitError={submitError}
          onClose={() => setShowSuggest(false)}
          onSubmit={handleSuggest}
          selectedCategory={selectedCategory}
          customCategoryName={customCategoryName}
          title={title}
          description={description}
          onCategoryChange={setSelectedCategory}
          onCustomCategoryNameChange={setCustomCategoryName}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
        />
      )}
    </>
  )
}

interface SuggestFormProps {
  categories: TipCategory[]
  submitting: boolean
  submitError: string | null
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  selectedCategory: string
  customCategoryName: string
  title: string
  description: string
  onCategoryChange: (value: string) => void
  onCustomCategoryNameChange: (value: string) => void
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
  customCategoryName,
  title,
  description,
  onCategoryChange,
  onCustomCategoryNameChange,
  onTitleChange,
  onDescriptionChange,
}: SuggestFormProps) {
  const isOther = selectedCategory.toLowerCase() === 'other'

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
              onChange={(e) => {
                onCategoryChange(e.target.value)
                if (e.target.value.toLowerCase() !== 'other') {
                  onCustomCategoryNameChange('')
                }
              }}
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            >
              <option value="all">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {isOther && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Custom Category Name</label>
              <input
                type="text"
                value={customCategoryName}
                onChange={(e) => onCustomCategoryNameChange(e.target.value)}
                placeholder="e.g. Campus Life"
                required={isOther}
                className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          )}

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
  categories: TipCategory[]
  onApprove: (id: string, categoryId?: string, customCategoryName?: string) => void
  onReject: (id: string, reason: string) => void
}

function AdminSuggestionCard({ suggestion, categories, onApprove, onReject }: AdminSuggestionCardProps) {
  const [showRejectForm, setShowRejectForm] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>(suggestion.category?.id || '')
  const [customCategoryName, setCustomCategoryName] = React.useState<string>(suggestion.custom_category_name || '')
  const isOther = suggestion.custom_category_name || selectedCategory === ''

  function handleReject() {
    if (!rejectionReason.trim()) return
    onReject(suggestion.id, rejectionReason)
    setShowRejectForm(false)
    setRejectionReason('')
  }

  function handleApprove() {
    const hasCustom = isOther && customCategoryName.trim()
    onApprove(suggestion.id, hasCustom ? undefined : selectedCategory, hasCustom ? customCategoryName.trim() : undefined)
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
          {suggestion.custom_category_name || suggestion.category?.name || 'General'}
        </span>
      </div>

      <p className="text-sm text-neutral-600 mb-4">{suggestion.description}</p>

      {isOther && (
        <div className="mb-3">
          <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wide">New Category Name</label>
          <input
            type="text"
            value={customCategoryName}
            onChange={(e) => setCustomCategoryName(e.target.value)}
            placeholder="Enter new category name"
            className="w-full px-3 h-9 rounded-lg border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      )}

      {!isOther && (
        <div className="mb-3">
          <label className="block text-xs font-bold text-neutral-700 mb-1 uppercase tracking-wide">Assign Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 h-9 rounded-lg border border-neutral-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          className="bg-green-500 hover:bg-green-600 text-white font-bold"
        >
          <Check className="h-4 w-4 mr-1" />
          {isOther ? 'Approve & Create Category' : 'Approve'}
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
