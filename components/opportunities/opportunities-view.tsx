'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, X, Check, Trash2, Bell, Briefcase, GraduationCap, BookOpen, Globe, CalendarDays, type LucideIcon } from 'lucide-react'
import { Opportunity } from '@/types'
import { OpportunitySuggestion } from '@/services/opportunity-suggestion-service'

interface OpportunitiesViewProps {
  opportunities: Opportunity[]
  pendingSuggestions: OpportunitySuggestion[]
  isAdmin: boolean
  userId: string | null
}

const OPPORTUNITY_TYPE_ICONS: Record<string, LucideIcon> = {
  job: Briefcase,
  internship: GraduationCap,
  scholarship: BookOpen,
  volunteer: Globe,
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
}: OpportunitiesViewProps) {
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<string>('job')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const [adminSuggestions, setAdminSuggestions] = React.useState<OpportunitySuggestion[]>([])

  const opportunitiesByType = React.useMemo(() => {
    const grouped: Record<string, Opportunity[]> = {}
    for (const opp of opportunities) {
      const type = opp.type || 'job'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(opp)
    }
    return grouped
  }, [opportunities])

  const pending = pendingSuggestions.filter(s => s.user_id === userId)

  async function handleAddOpportunity(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    if (!selectedType || !title || !description) {
      setSubmitError('All fields are required.')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, title, description }),
      })

      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit suggestion.')
      } else {
        setSubmitSuccess(true)
        setShowAddForm(false)
        setTitle('')
        setDescription('')
        setSelectedType('job')
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
                Opportunities
              </h1>
              <p className="text-neutral-600 mt-2">
                Discover internships, jobs, scholarships, volunteering opportunities, and events tailored for you.
              </p>
            </div>
            <Link href="/opportunities/applications">
              <Button variant="secondary" className="rounded-full font-bold">
                My Applications
              </Button>
            </Link>
          </div>
        </div>

        {userId && (
          <div className="mb-6 md:mb-8 flex items-center gap-3">
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="rounded-full font-bold border-2 border-neutral-200 hover:border-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
            {pending.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                <Bell className="h-3 w-3" />
                {pending.length} pending
              </span>
            )}
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center mb-6">
            <p className="text-sm font-medium text-green-800">
              Your suggestion has been submitted and is awaiting admin review!
            </p>
          </div>
        )}

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
                      <span className="text-xs text-neutral-400 uppercase">
                        {OPPORTUNITY_TYPE_LABELS[s.type] || 'General'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {OPPORTUNITY_TYPE_VALUES.map(type => {
          const typeOpportunities = opportunitiesByType[type] || []
          if (typeOpportunities.length === 0) return null

          const Icon = OPPORTUNITY_TYPE_ICONS[type] || Briefcase

          return (
            <div key={type} className="mb-8 md:mb-10">
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
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            </div>
          )
        })}

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

        {opportunities.length === 0 && !pending.length && (
          <div className="text-center py-16 md:py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-base md:text-lg">
              No opportunities available yet.
            </p>
          </div>
        )}
      </div>

      {showAddForm && (
        <AddOpportunityForm
          submitting={submitting}
          submitError={submitError}
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddOpportunity}
          selectedType={selectedType}
          title={title}
          description={description}
          onTypeChange={setSelectedType}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
        />
      )}
    </div>
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
  onTypeChange: (value: string) => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

function AddOpportunityForm({
  submitting,
  submitError,
  onClose,
  onSubmit,
  selectedType,
  title,
  description,
  onTypeChange,
  onTitleChange,
  onDescriptionChange,
}: AddOpportunityFormProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <h2 className="text-lg font-black text-neutral-900 uppercase italic">Add Opportunity</h2>
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

          {submitError && (
            <p className="text-xs font-medium text-red-600">{submitError}</p>
          )}

          <Button type="submit" className="w-full font-bold" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  )
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const Icon = OPPORTUNITY_TYPE_ICONS[opportunity.type || 'job'] || Briefcase

  return (
    <Link href={`/opportunities/${opportunity.id}`} className="block">
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6 hover:shadow-lg transition-all h-full">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-black text-neutral-900 flex-1">{opportunity.title}</h3>
        </div>
        <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
          {opportunity.description}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-neutral-400 uppercase">
            {OPPORTUNITY_TYPE_LABELS[opportunity.type || 'job'] || 'General'}
          </span>
        </div>
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
