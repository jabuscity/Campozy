'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, X, Check, Trash2, Bell, Briefcase, GraduationCap, BookOpen, HandHeart, CalendarDays, Clock, ChevronDown, MapPin, ExternalLink, DollarSign, Home, type LucideIcon } from 'lucide-react'
import { Opportunity } from '@/types'
import CommunityRailWrapper from '@/components/community/community-rail-wrapper'
import { OpportunitySuggestion } from '@/services/opportunity-suggestion-service'

interface OpportunitiesViewProps {
  opportunities: Opportunity[]
  pendingSuggestions: OpportunitySuggestion[]
  isAdmin: boolean
  userId: string | null
  variant?: 'full' | 'embedded'
}

const OPPORTUNITY_TYPE_ICONS: Record<string, LucideIcon> = {
  job: Briefcase,
  internship: GraduationCap,
  scholarship: BookOpen,
  volunteer: HandHeart,
  event: CalendarDays,
}

const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  job: 'Jobs',
  internship: 'Internships',
  scholarship: 'Scholarships',
  volunteer: 'Volunteering',
  event: 'Events',
}

const OPPORTUNITY_TYPE_VALUES = ['job', 'internship', 'scholarship', 'volunteer', 'event']

export function OpportunitiesView({
  opportunities,
  pendingSuggestions,
  isAdmin,
  userId,
  variant = 'full',
}: OpportunitiesViewProps) {
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<string>('all')
  const [selectedTypeForForm, setSelectedTypeForForm] = React.useState<string>('job')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const [adminSuggestions, setAdminSuggestions] = React.useState<OpportunitySuggestion[]>([])
  const [link, setLink] = React.useState('')
  const [deadline, setDeadline] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [isRemote, setIsRemote] = React.useState(false)
  const [compensation, setCompensation] = React.useState('')
  const [requirements, setRequirements] = React.useState('')
  const [visibleCount, setVisibleCount] = React.useState(15)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [headerHidden, setHeaderHidden] = React.useState(false)
  const headerHiddenRef = React.useRef(headerHidden)
  React.useEffect(() => { headerHiddenRef.current = headerHidden }, [headerHidden])
  const pendingScrollPosition = React.useRef<number | null>(null)

  const handleCardClick = React.useCallback((id: string) => {
    setExpandedId(prev => {
      const next = prev === id ? null : id
      if (next) {
        setTimeout(() => {
          const el = document.getElementById(`opp-card-${id}`)
          if (el) {
            const headerOffset = headerHiddenRef.current ? 0 : 64
            const filterStrip = document.querySelector('.mobile-opportunity-filters')
            const filterStripHeight = filterStrip ? filterStrip.getBoundingClientRect().height : 0
            const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
             const offsetPosition = elementPosition - headerOffset - (headerHiddenRef.current ? filterStripHeight : 0) - 16
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
          }
        }, 50)
      }
      return next
    })
  }, [])

  const handleTypeChange = React.useCallback((type: string) => {
    const nextType = selectedType === type ? 'all' : type
    pendingScrollPosition.current = window.scrollY
    setSelectedType(nextType)

    setTimeout(() => {
      pendingScrollPosition.current = null
      if (nextType === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (headerHiddenRef.current) {
        const el = document.getElementById(`opp-category-${nextType}`)
        if (el) {
          const headerOffset = headerHiddenRef.current ? 0 : 64
          const filterStrip = document.querySelector('.mobile-opportunity-filters')
          const filterStripHeight = filterStrip ? filterStrip.getBoundingClientRect().height : 0
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - headerOffset - filterStripHeight - 32
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
        }
      }
    }, 0)
  }, [selectedType])

  const sortedOpportunities = React.useMemo(() => {
    return [...opportunities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [opportunities])

  const opportunitiesByType = React.useMemo(() => {
    const grouped: Record<string, Opportunity[]> = {}
    for (const opp of sortedOpportunities) {
      const type = opp.type || 'job'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(opp)
    }
    return grouped
  }, [sortedOpportunities])

  const pending = pendingSuggestions.filter(s => s.user_id === userId)

  async function handleAddOpportunity(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    if (!selectedTypeForForm || !title || !description) {
      setSubmitError('All fields are required.')
      setSubmitting(false)
      return
    }

    try {
      const requirementsArray = requirements
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0)

      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedTypeForForm,
          title,
          description,
          link,
          deadline,
          location: location || null,
          isRemote,
          compensation: compensation || null,
          requirements: requirementsArray,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit suggestion.')
      } else {
        setSubmitSuccess(true)
        setShowAddForm(false)
        setTitle('')
        setDescription('')
        setLink('')
        setDeadline('')
        setLocation('')
        setIsRemote(false)
        setCompensation('')
        setRequirements('')
        setSelectedTypeForForm('job')
        window.location.reload()
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleApprove(id: string) {
    const res = await fetch(`/api/opportunities/suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })
    if (res.ok) {
      setAdminSuggestions(prev => prev.filter(s => s.id !== id))
    }
  }

  async function handleReject(id: string, reason: string) {
    const res = await fetch(`/api/opportunities/suggestions/${id}`, {
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
      fetch('/api/opportunities/suggestions')
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

  React.useLayoutEffect(() => {
    if (pendingScrollPosition.current !== null && window.scrollY !== pendingScrollPosition.current) {
      window.scrollTo(0, pendingScrollPosition.current)
    }
  })

  const filteredTypes = React.useMemo(() => selectedType === 'all' ? OPPORTUNITY_TYPE_VALUES : [selectedType], [selectedType])

  const flattenedOpportunities = React.useMemo(() => {
    const items: Array<{ type: string; opportunity: Opportunity }> = []
    for (const type of filteredTypes) {
      const opps = opportunitiesByType[type] || []
      for (const opp of opps) {
        items.push({ type, opportunity: opp })
      }
    }
    return items
  }, [opportunitiesByType, filteredTypes])

  const visibleOpportunities = flattenedOpportunities.slice(0, visibleCount)
  const hasMore = visibleCount < flattenedOpportunities.length

  const browseSection = (
    <>
      {pending.length > 0 && userId && (
        <div className="mb-6 md:mb-8">
          <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-4">
            Your Suggestions (Pending)
          </h3>
          <div className="space-y-3">
            {pending.map(s => (
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
                    <span className="text-xs font-bold text-neutral-400 uppercase">
                      {OPPORTUNITY_TYPE_LABELS[s.type] || 'General'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredTypes.filter(type => selectedType === 'all' || filteredTypes.includes(type)).map(type => {
        const typeOpportunities = (opportunitiesByType[type] || []).filter(opp => 
          visibleOpportunities.some(vo => vo.opportunity.id === opp.id && vo.type === type)
        )
        if (typeOpportunities.length === 0) return null

        const Icon = OPPORTUNITY_TYPE_ICONS[type] || Briefcase

        return (
          <div key={type} id={`opp-category-${type}`} className={`mb-8 md:mb-10 ${headerHidden ? 'mt-20' : ''}`}>
            <div className="flex items-center gap-3 mb-4 md:mb-5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-neutral-900 uppercase tracking-tight">
                {OPPORTUNITY_TYPE_LABELS[type] || type}
              </h2>
              <div className="flex-1 h-px bg-neutral-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {typeOpportunities.map(opportunity => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity} 
                  isExpanded={expandedId === opportunity.id}
                  onMobileClick={handleCardClick}
                />
              ))}
            </div>
          </div>
        )
      })}

      {opportunities.length === 0 && !pending.length && (
        <div className="text-center py-16 md:py-20 bg-white rounded-3xl border border-neutral-200">
          <p className="text-neutral-500 text-base md:text-lg">
            No opportunities available yet.
          </p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount(prev => prev + 15)}
            className="inline-flex items-center gap-2 text-sm font-black text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-widest"
          >
            <span className="h-px w-8 bg-neutral-300"></span>
            More
            <span className="h-px w-8 bg-neutral-300"></span>
          </button>
        </div>
      )}

      {!hasMore && visibleOpportunities.length > 0 && (
        <div className="flex flex-col items-center gap-3 mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-widest"
          >
            <span className="h-px w-6 bg-neutral-300"></span>
            Back to top
            <span className="h-px w-6 bg-neutral-300"></span>
          </button>
        </div>
      )}

      {adminSuggestions.length > 0 && (
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
    </>
  )

  return (
    <>
      <div className={variant === 'embedded' ? '' : 'min-h-screen bg-neutral-50'}>
        <div className={variant === 'embedded' ? '' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12'}>
          <div className="flex gap-6">
            {/* Left Pane - Desktop */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <CommunityRailWrapper
                activeTab="discussions"
                categories={[]}
                discussions={[]}
                events={[]}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Type Filters */}
              <div className="mb-6 md:mb-8">
                {headerHidden && (
                  <div className="lg:hidden h-14" aria-hidden="true" />
                )}
                <div className={`mobile-opportunity-filters lg:hidden ${headerHidden ? 'fixed top-0 inset-x-0 z-[60] bg-blue-50/90 backdrop-blur-md px-4 pt-3 pb-3 shadow-md' : 'sticky top-16 z-30 bg-neutral-50 mx-4 px-4 pb-3'}`}>
                  <div className="flex w-full">
                    <div className="flex flex-1 items-center justify-between bg-blue-100 rounded-3xl p-1">
                      {OPPORTUNITY_TYPE_VALUES.filter(type => type !== 'event').map(type => {
                        const Icon = OPPORTUNITY_TYPE_ICONS[type]
                        const isActive = selectedType === type
                        return (
                          <button
                            key={type}
                            onClick={() => handleTypeChange(type)}
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
              </div>

              {submitSuccess && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center mb-6">
                  <p className="text-sm font-medium text-green-800">
                    Your suggestion has been submitted and is awaiting admin review!
                  </p>
                </div>
              )}

              {/* Mobile: always browse */}
              <div className="lg:hidden mt-8 md:mt-8 pb-20">
                {browseSection}
              </div>

              {/* Desktop */}
              <div className="hidden lg:block">
                {browseSection}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button - Fixed position for mobile, inline for desktop */}
      {userId && (
        <>
          <button
            onClick={() => setShowAddForm(true)}
            className="lg:hidden fixed bottom-20 right-5 h-10 w-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-40"
            aria-label="Add Opportunity"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="hidden lg:block">
            <button
              onClick={() => setShowAddForm(true)}
              className="h-10 w-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
              aria-label="Add Opportunity"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </>
      )}

      {showAddForm && (
        <AddOpportunityForm
          submitting={submitting}
          submitError={submitError}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddOpportunity}
          selectedType={selectedTypeForForm}
          title={title}
          description={description}
          link={link}
          deadline={deadline}
          location={location}
          isRemote={isRemote}
          compensation={compensation}
          requirements={requirements}
          onTypeChange={setSelectedTypeForForm}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onLinkChange={setLink}
          onDeadlineChange={setDeadline}
          onLocationChange={setLocation}
          onIsRemoteChange={setIsRemote}
          onCompensationChange={setCompensation}
          onRequirementsChange={setRequirements}
        />
      )}
    </>
  )
}

interface AddOpportunityFormProps {
  submitting: boolean
  submitError: string | null
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  selectedType: string
  title: string
  description: string
  link: string
  deadline: string
  location: string
  isRemote: boolean
  compensation: string
  requirements: string
  onTypeChange: (value: string) => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onLinkChange: (value: string) => void
  onDeadlineChange: (value: string) => void
  onLocationChange: (value: string) => void
  onIsRemoteChange: (value: boolean) => void
  onCompensationChange: (value: string) => void
  onRequirementsChange: (value: string) => void
}

function AddOpportunityForm({
  submitting,
  submitError,
  onClose,
  onSubmit,
  selectedType,
  title,
  description,
  link,
  deadline,
  location,
  isRemote,
  compensation,
  requirements,
  onTypeChange,
  onTitleChange,
  onDescriptionChange,
  onLinkChange,
  onDeadlineChange,
  onLocationChange,
  onIsRemoteChange,
  onCompensationChange,
  onRequirementsChange,
}: AddOpportunityFormProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 max-h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 shrink-0">
          <h2 className="text-lg font-black text-neutral-900 uppercase italic">Add Opportunity</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Category</label>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            >
              {OPPORTUNITY_TYPE_VALUES.map(t => (
                <option key={t} value={t}>{OPPORTUNITY_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. Summer Internship at Google"
              required
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe the opportunity in detail..."
              required
              rows={4}
              className="w-full px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Link / Contact</label>
            <input
              type="url"
              value={link}
              onChange={(e) => onLinkChange(e.target.value)}
              placeholder="https://example.com/apply or contact@example.com"
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Application Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="e.g. Nairobi, Kenya"
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isRemote"
              checked={isRemote}
              onChange={(e) => onIsRemoteChange(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isRemote" className="text-sm font-bold text-neutral-700 uppercase tracking-wide">Remote</label>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Compensation</label>
            <input
              type="text"
              value={compensation}
              onChange={(e) => onCompensationChange(e.target.value)}
              placeholder="e.g. Paid, Unpaid, Stipend"
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Requirements</label>
            <textarea
              value={requirements}
              onChange={(e) => onRequirementsChange(e.target.value)}
              placeholder={"One requirement per line\ne.g. Must be enrolled in university"}
              rows={3}
              className="w-full px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {submitError && (
            <p className="text-xs font-medium text-red-600">{submitError}</p>
          )}

          <Button type="submit" className="w-full font-bold shrink-0" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  )
}

function OpportunityCard({ opportunity, isExpanded, onMobileClick }: { opportunity: Opportunity, isExpanded: boolean, onMobileClick: (id: string) => void }) {
  const Icon = OPPORTUNITY_TYPE_ICONS[opportunity.type || 'job'] || Briefcase

  return (
    <Link 
      href={`/opportunities/${opportunity.id}`} 
      className="block"
      id={`opp-card-${opportunity.id}`}
      onClick={(e) => {
        if (window.innerWidth < 1024) {
          e.preventDefault()
          onMobileClick(opportunity.id)
        }
      }}
    >
      <div className={`rounded-2xl border p-4 md:p-6 transition-all duration-300 ease-in-out h-full ${isExpanded ? 'bg-orange-50 border-orange-200 shadow-md' : 'bg-white border-neutral-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200/60'}`}>
        <div className="flex items-start gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-black text-neutral-900 flex-1">{opportunity.title}</h3>
          <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform duration-300 lg:hidden ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
         
        {isExpanded && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-neutral-600 leading-relaxed">
              {opportunity.description}
            </p>
            
            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-black text-neutral-900 uppercase tracking-tight mb-2">Requirements</h4>
                <ul className="space-y-2">
                  {opportunity.requirements.map((req: unknown, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-700">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="leading-snug">{typeof req === 'string' ? req : JSON.stringify(req)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="space-y-3 pt-4 border-t-2 border-orange-200">
              <h4 className="text-sm font-black text-neutral-900 uppercase tracking-tight mb-2">Details</h4>
              <div className="space-y-3">
                {opportunity.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-xs font-black text-neutral-900 uppercase tracking-wide block">Location</span>
                      <span className="text-sm text-neutral-700">{opportunity.location}</span>
                    </div>
                  </div>
                )}
                {opportunity.is_remote && (
                  <div className="flex items-start gap-3">
                    <Home className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-xs font-black text-neutral-900 uppercase tracking-wide block">Remote</span>
                      <span className="text-sm text-neutral-700">Yes</span>
                    </div>
                  </div>
                )}
                {opportunity.compensation && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-xs font-black text-neutral-900 uppercase tracking-wide block">Compensation</span>
                      <span className="text-sm text-neutral-700">{opportunity.compensation}</span>
                    </div>
                  </div>
                )}
                {opportunity.deadline && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-xs font-black text-neutral-900 uppercase tracking-wide block">Deadline</span>
                      <span className="text-sm text-neutral-700">{new Date(opportunity.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {opportunity.application_url && (
              <button
                onClick={() => window.open(opportunity.application_url as string, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors w-full"
              >
                Apply Now <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        {!isExpanded && (
          <>
            <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
              {opportunity.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium text-neutral-600">{new Date(opportunity.created_at).toLocaleDateString('en-US')}</span>
            </div>
          </>
        )}
      </div>
    </Link>
  )
}

interface AdminSuggestionCardProps {
  suggestion: OpportunitySuggestion
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
          <span className="text-xs text-neutral-400 uppercase">
            {OPPORTUNITY_TYPE_LABELS[suggestion.type] || 'General'}
          </span>
        </div>
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
