'use client'

import * as React from 'react'
import { X, MapPin, Zap, Droplets, Wifi, Shield, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const utilityTypes = [
  { id: 'electricity', label: 'Electricity', icon: Zap },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'security', label: 'Security', icon: Shield },
]

const severities = [
  { id: 'low', label: 'Low', color: 'text-green-600 bg-green-50 border-green-200' },
  { id: 'medium', label: 'Medium', color: 'text-secondary bg-secondary/10 border-secondary/20' },
  { id: 'high', label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'critical', label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200' },
]

export function ReportUtilityModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const [propertyId, setPropertyId] = React.useState('')
  const [utilityType, setUtilityType] = React.useState('')
  const [severity, setSeverity] = React.useState('medium')
  const [description, setDescription] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const reset = React.useCallback(() => {
    setPropertyId('')
    setUtilityType('')
    setSeverity('medium')
    setDescription('')
    setSubmitting(false)
    setError(null)
    setSuccess(false)
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
        setError('Please sign in to report utility issues.')
        setSubmitting(false)
        return
      }

      const { error: insertError } = await supabase
        .from('utility_incidents')
        .insert({
          property_id: propertyId,
          utility_type_id: utilityType,
          reported_by: user.id,
          description,
          severity,
        })

      if (insertError) {
        setError(insertError.message)
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        handleClose()
        router.refresh()
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Report Utility Issue</h2>
              <p className="text-xs text-neutral-500">Help the community stay informed</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <p className="text-lg font-black text-neutral-900">Report Submitted</p>
              <p className="text-sm text-neutral-500 mt-1">Thank you for keeping the community informed.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                  Property ID
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    placeholder="Enter property UUID"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                  Utility Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {utilityTypes.map((type) => {
                    const Icon = type.icon
                    const isActive = utilityType === type.id
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setUtilityType(type.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          isActive
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-bold">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                  Severity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {severities.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeverity(s.id)}
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all ${severity === s.id ? s.color + ' border-current' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the utility issue..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-tight hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
