'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

type Step = 'welcome' | 'profile' | 'preferences' | 'account'

const STUDY_TYPES = [
  { value: 'solo', label: 'Solo' },
  { value: 'group', label: 'Group' },
  { value: 'random', label: 'Random' },
  { value: 'planner', label: 'Planner' },
  { value: 'early_riser', label: 'Early Riser' },
  { value: 'night_owl', label: 'Night Owl' },
]

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
}

function OnboardingWizardContent({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>('welcome')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [campuses, setCampuses] = React.useState<{ id: string; name: string }[]>([])
  const [programs, setPrograms] = React.useState<{ id: string; name: string }[]>([])
  const [highSchools, setHighSchools] = React.useState<{ id: string; name: string }[]>([])
  const [loadingOptions, setLoadingOptions] = React.useState(true)

  const [form, setForm] = React.useState({
    full_name: '',
    date_of_birth: '',
    campus_id: '',
    former_school_id: '',
    program_id: '',
    personality: '',
    fun_activities: '',
    religious_inclination: '',
    study_type: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })

  React.useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    Promise.all([
      supabase.from('campuses').select('id, name').order('name').then((r) => r.data || []),
      supabase.from('academic_programs').select('id, name').order('name').then((r) => r.data || []),
      supabase.from('high_schools').select('id, name').order('name').then((r) => r.data || []),
    ]).then(([c, p, h]) => {
      if (!cancelled) {
        setCampuses(c as { id: string; name: string }[])
        setPrograms(p as { id: string; name: string }[])
        setHighSchools(h as { id: string; name: string }[])
        setLoadingOptions(false)
      }
    }).catch(() => {
      if (!cancelled) setLoadingOptions(false)
    })
    return () => { cancelled = true }
  }, [])

  const update = (patch: Record<string, unknown>) => setForm({ ...form, ...patch })

  const disableNav = saving || loadingOptions

  const handleNext = () => {
    setError(null)
    if (step === 'welcome') setStep('profile')
    else if (step === 'profile') setStep('preferences')
    else if (step === 'preferences') setStep('account')
  }

  const handleBack = () => {
    setError(null)
    if (step === 'account') setStep('preferences')
    else if (step === 'preferences') setStep('profile')
    else if (step === 'profile') setStep('welcome')
  }

  const handleSubmit = async () => {
    setError(null)

    if (!form.username.trim()) {
      setError('Username is required.')
      return
    }
    if (!form.email.trim()) {
      setError('Email is required.')
      return
    }
    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!form.terms) {
      setError('You must accept the terms and conditions.')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          date_of_birth: form.date_of_birth || null,
          campus_id: form.campus_id || null,
          former_school_id: form.former_school_id || null,
          program_id: form.program_id || null,
          enrollment_year: form.date_of_birth ? new Date(form.date_of_birth).getFullYear() : null,
          personality: form.personality || null,
          fun_activities: form.fun_activities || null,
          religious_inclination: form.religious_inclination || null,
          study_type: form.study_type || null,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Onboarding failed.')
        setSaving(false)
        return
      }

      router.replace('/')
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-4 h-12 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'

  const steps: { key: Step; label: string }[] = [
    { key: 'welcome', label: 'Welcome' },
    { key: 'profile', label: 'Profile' },
    { key: 'preferences', label: 'Preferences' },
    { key: 'account', label: 'Account' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === step)

  return (
    <Modal isOpen={true} onClose={onClose} title="">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  idx <= currentStepIndex ? 'bg-primary' : 'bg-neutral-200'
                }`}
              />
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  idx <= currentStepIndex ? 'text-primary' : 'text-neutral-400'
                }`}
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && <div className="mx-1 h-px w-4 bg-neutral-200" />}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {step === 'welcome' && (
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-neutral-900">Welcome to Campozy</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              A new platform built for students. Find better housing, navigate campus life smoothly, and connect with fellow students and alumni who&apos;ve been in your shoes.
            </p>
            <p className="text-xs text-neutral-500">Let&apos;s set up your profile so we can personalize your experience.</p>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => update({ full_name: e.target.value })}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Date of Birth</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => update({ date_of_birth: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Campus / College</label>
              <select
                value={form.campus_id}
                onChange={(e) => update({ campus_id: e.target.value })}
                className={inputClass}
              >
                <option value="">Select a campus...</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Former School</label>
              <select
                value={form.former_school_id}
                onChange={(e) => update({ former_school_id: e.target.value })}
                className={inputClass}
              >
                <option value="">Select a school...</option>
                {highSchools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Academic Program</label>
              <select
                value={form.program_id}
                onChange={(e) => update({ program_id: e.target.value })}
                className={inputClass}
              >
                <option value="">Select a program...</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 'preferences' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Personality</label>
              <textarea
                value={form.personality}
                onChange={(e) => update({ personality: e.target.value })}
                placeholder="Describe your personality in a few words..."
                className={`${inputClass} min-h-[80px] resize-none`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Fun Activities / Hobbies</label>
              <textarea
                value={form.fun_activities}
                onChange={(e) => update({ fun_activities: e.target.value })}
                placeholder="Sports, gaming, music, reading, etc."
                className={`${inputClass} min-h-[80px] resize-none`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Religious Inclination</label>
              <input
                type="text"
                value={form.religious_inclination}
                onChange={(e) => update({ religious_inclination: e.target.value })}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Study Type</label>
              <div className="grid grid-cols-2 gap-2">
                {STUDY_TYPES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update({ study_type: option.value })}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-tight transition-colors ${
                      form.study_type === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'account' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Preferred Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => update({ username: e.target.value })}
                placeholder="Choose a unique username"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update({ password: e.target.value })}
                placeholder="Min. 8 characters"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-neutral-900 uppercase tracking-widest">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update({ confirmPassword: e.target.value })}
                placeholder="Repeat password"
                className={inputClass}
              />
            </div>
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                checked={form.terms}
                onChange={(e) => update({ terms: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-xs text-neutral-600 cursor-pointer select-none">
                I agree to the <a href="/terms" className="text-primary underline">Terms and Conditions</a> and <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div>
            {step !== 'welcome' && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={disableNav}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step !== 'account' ? (
              <Button type="button" onClick={handleNext} disabled={disableNav}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={disableNav}>
                {saving ? 'Creating...' : 'Get Started'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      {isOpen && <OnboardingWizardContent key={isOpen ? 'open' : 'closed'} onClose={onClose} />}
    </Modal>
  )
}
