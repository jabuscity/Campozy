'use client'

import * as React from 'react'
import { MapPin, Zap, Droplets, Wifi, Shield, Users, Home, GraduationCap, Navigation, HelpCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { sendUtilityReportNotifications } from '@/services/notification-service'
import type { Property, Campus } from '@/types'

const severities = [
  { id: 'low', label: 'Low', color: 'text-green-600', bg: 'bg-green-500', track: '#22c55e' },
  { id: 'medium', label: 'Medium', color: 'text-secondary', bg: 'bg-secondary', track: '#6366f1' },
  { id: 'high', label: 'High', color: 'text-orange-600', bg: 'bg-orange-500', track: '#f97316' },
  { id: 'critical', label: 'Critical', color: 'text-red-600', bg: 'bg-red-500', track: '#ef4444' },
]

const STANDARD_UTILITY_TYPES = [
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'electricity', label: 'Electricity', icon: Zap },
  { id: 'internet', label: 'Internet', icon: Wifi },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'accessibility', label: 'Accessibility', icon: Users },
]

const STANDARD_UTILITY_NAMES = new Set(STANDARD_UTILITY_TYPES.map(t => t.label.toLowerCase()))

interface DbUtilityType {
  id: string
  name: string
}

interface ReportFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface SeveritySliderProps {
  value: string
  onChange: (value: string) => void
}

function SeveritySlider({ value, onChange }: SeveritySliderProps) {
  const index = severities.findIndex(s => s.id === value)
  const activeIndex = index >= 0 ? index : 1
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const getValueFromPosition = React.useCallback((clientX: number) => {
    if (!trackRef.current) return activeIndex
    const rect = trackRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    return Math.round(pct * (severities.length - 1))
  }, [activeIndex])

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const idx = getValueFromPosition(e.clientX)
    onChange(severities[idx].id)
  }, [getValueFromPosition, onChange])

  React.useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (e: PointerEvent) => {
      const idx = getValueFromPosition(e.clientX)
      onChange(severities[idx].id)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, getValueFromPosition, onChange])

  const trackTipY = 12
  const trackRightTopY = 6
  const trackRightBottomY = 18
  const fillX = (activeIndex / (severities.length - 1)) * 100
  const fillTopY = trackTipY + (trackRightTopY - trackTipY) * (fillX / 100)
  const fillBottomY = trackTipY + (trackRightBottomY - trackTipY) * (fillX / 100)

  return (
    <div className="select-none">
      <div
        ref={trackRef}
        className="relative w-full h-6 cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        style={{ touchAction: 'none' }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 24"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="0,12 100,6 100,18"
            fill="#e5e7eb"
          />
          <polygon
            points={`0,12 ${fillX},${fillTopY} ${fillX},${fillBottomY}`}
            fill={severities[activeIndex].track}
            className="transition-all duration-200"
          />
        </svg>

        {severities.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={s.label}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
            style={{ left: `${(i / (severities.length - 1)) * 100}%` }}
            onClick={() => onChange(s.id)}
          >
            <span
              className={`block rounded-full border-2 border-white shadow-sm transition-all duration-200 ${
                i === activeIndex ? 'h-6 w-6' : 'h-5 w-5'
              }`}
              style={{
                backgroundColor: i <= activeIndex ? s.track : '#e5e7eb',
              }}
            />
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {severities.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={`text-[10px] lg:text-xs font-bold uppercase tracking-tighter transition-colors ${
              i === activeIndex ? s.color : 'text-neutral-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ReportForm({ onSuccess, onCancel }: ReportFormProps) {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [locationType, setLocationType] = React.useState<'property' | 'campus' | 'other'>('property')
  const [selectedPropertyId, setSelectedPropertyId] = React.useState('')
  const [selectedCampusId, setSelectedCampusId] = React.useState('')
  const [locationDescription, setLocationDescription] = React.useState('')
  const [utilityType, setUtilityType] = React.useState('')
  const [dbUtilityTypes, setDbUtilityTypes] = React.useState<DbUtilityType[]>([])
  const [utilityTypesLoading, setUtilityTypesLoading] = React.useState(true)
  const [customUtilityType, setCustomUtilityType] = React.useState('')
  const [severity, setSeverity] = React.useState('medium')
  const [description, setDescription] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [properties, setProperties] = React.useState<Property[]>([])
  const [campuses, setCampuses] = React.useState<Campus[]>([])
  const [loading, setLoading] = React.useState(true)
  const [detectingLocation, setDetectingLocation] = React.useState(false)

  const reset = React.useCallback(() => {
    setStep(1)
    setLocationType('property')
    setSelectedPropertyId('')
    setSelectedCampusId('')
    setLocationDescription('')
    setUtilityType('')
    setDbUtilityTypes([])
    setUtilityTypesLoading(true)
    setCustomUtilityType('')
    setSeverity('medium')
    setDescription('')
    setSubmitting(false)
    setError(null)
    setSuccess(false)
    setProperties([])
    setCampuses([])
    setLoading(true)
  }, [])

  const canGoNextStep1 = !!utilityType
  const canGoNextStep2 = locationType === 'property' ? !!selectedPropertyId
    : locationType === 'campus' ? !!selectedCampusId
    : !!locationDescription

  React.useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      const supabase = createClient()

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (cancelled) return

        const { data: allCampuses } = await supabase
          .from('campuses')
          .select('*, universities(name)')
          .order('name')

        if (!cancelled) setCampuses(allCampuses || [])

        const { data: utilityTypesData } = await supabase
          .from('utility_types')
          .select('id, name')
          .order('name')

        if (!cancelled) {
          setDbUtilityTypes(utilityTypesData || [])
          setUtilityTypesLoading(false)
        }

        if (!user) {
          if (!cancelled) setLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, campus_id, user_roles(*, roles(*))')
          .eq('id', user.id)
          .single()

        if (profile && !cancelled) {
          const userIsScout = profile.user_roles?.some(
            (ur) => ur.roles?.[0]?.name === 'scout'
          )

          if (userIsScout) {
            const { data: scoutData } = await supabase
              .from('scouts')
              .select('region_id')
              .eq('user_id', user.id)
              .single()

            if (scoutData?.region_id && !cancelled) {
              const { data: regionProperties } = await supabase
                .from('properties')
                .select(`
                  *,
                  neighborhood(*, cities(name))
                `)
                .eq('is_active', true)
                .limit(30)

              if (!cancelled) setProperties(regionProperties || [])
            }
          } else if (profile.campus_id) {
            const { data: campusProps } = await supabase
              .from('properties')
              .select(`
                *,
                neighborhood(*, cities(name))
              `)
              .eq('is_active', true)
              .limit(20)

            if (!cancelled) setProperties(campusProps || [])
          }
        }
      } catch (err) {
        console.error('Failed to load report data:', err)
        setUtilityTypesLoading(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  const detectLocation = React.useCallback(async () => {
    setDetectingLocation(true)

    try {
      if (!navigator.geolocation) return

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      const { latitude, longitude } = position.coords

      const supabase = createClient()
      const { data: nearbyCampuses } = await supabase
        .from('campuses')
        .select('*, universities(name)')
        .limit(5)

      if (nearbyCampuses && nearbyCampuses.length > 0) {
        let closest = nearbyCampuses[0]
        let minDist = Infinity

        for (const campus of nearbyCampuses) {
          if (campus.location_lat && campus.location_lng) {
            const dist = Math.sqrt(
              Math.pow(campus.location_lat - latitude, 2) +
              Math.pow(campus.location_lng - longitude, 2)
            )
            if (dist < minDist) {
              minDist = dist
              closest = campus
            }
          }
        }

        setSelectedCampusId(closest.id)
        setLocationType('campus')
      }
    } catch {
      // GPS detection failed silently
    } finally {
      setDetectingLocation(false)
    }
  }, [])

  const requestGpsLocation = React.useCallback(() => {
    if (!navigator.geolocation) return

    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        const supabase = createClient()
        const { data: nearbyCampuses } = await supabase
          .from('campuses')
          .select('*, universities(name)')
          .limit(5)

        if (nearbyCampuses && nearbyCampuses.length > 0) {
          let closest = nearbyCampuses[0]
          let minDist = Infinity

          for (const campus of nearbyCampuses) {
            if (campus.location_lat && campus.location_lng) {
              const dist = Math.sqrt(
                Math.pow(campus.location_lat - latitude, 2) +
                Math.pow(campus.location_lng - longitude, 2)
              )
              if (dist < minDist) {
                minDist = dist
                closest = campus
              }
            }
          }

          setSelectedCampusId(closest.id)
          setLocationType('campus')
        }

        setDetectingLocation(false)
      },
      (err) => {
        console.error('GPS error:', err)
        setDetectingLocation(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

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

      let finalPropertyId: string | null = null
      let finalCampusId: string | null = null
      let finalTitle = ''
      let finalUtilityTypeId = utilityType
      let finalUtilityLabel = ''

      if (utilityType === 'other') {
        finalUtilityLabel = customUtilityType || 'Other'
        finalUtilityTypeId = 'other'
      } else {
        const standardType = STANDARD_UTILITY_TYPES.find(t => t.id === utilityType)
        const dbType = dbUtilityTypes.find(t => t.id === utilityType)
        finalUtilityLabel = standardType?.label || dbType?.name || 'Utility'
      }

      if (locationType === 'property' && selectedPropertyId) {
        finalPropertyId = selectedPropertyId
        const prop = properties.find(p => p.id === selectedPropertyId)
        finalTitle = `${finalUtilityLabel} issue at ${prop?.name || 'property'}`
      } else if (locationType === 'campus' && selectedCampusId) {
        finalCampusId = selectedCampusId
        const campus = campuses.find(c => c.id === selectedCampusId)
        finalTitle = `${finalUtilityLabel} issue at ${campus?.name || 'campus'}`
      } else if (locationType === 'other' && locationDescription) {
        finalTitle = `${finalUtilityLabel} issue: ${locationDescription}`
      } else {
        setError('Please select a location.')
        setSubmitting(false)
        return
      }

      const { data: inserted, error: insertError } = await supabase
        .from('utility_reports')
        .insert({
          property_id: finalPropertyId,
          campus_id: finalCampusId,
          utility_type_id: finalUtilityTypeId,
          user_id: user.id,
          status: 'active',
          severity,
          title: finalTitle,
          description,
          hours_available_per_day: null,
          is_verified: false,
        })
        .select('id')
        .single()

      if (insertError || !inserted) {
        setError(insertError?.message || 'Failed to submit report.')
        setSubmitting(false)
        return
      }

      await supabase.from('utility_incidents').insert({
        property_id: finalPropertyId,
        utility_type_id: finalUtilityTypeId,
        reported_by: user.id,
        title: finalTitle,
        description,
        severity,
        location_type: locationType,
        location_description: locationType === 'other' ? locationDescription : null,
      })

      await sendUtilityReportNotifications({
        incidentId: inserted.id,
        propertyId: finalPropertyId,
        campusId: finalCampusId,
        utilityType: finalUtilityLabel,
        severity,
        description,
        reportedBy: user.id,
        title: finalTitle,
      })

      setSuccess(true)
      setTimeout(() => {
        reset()
        onSuccess?.()
        if (onCancel) {
          onCancel()
        } else {
          router.refresh()
        }
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  const renderLocationSection = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-neutral-100 rounded-xl" />
          <div className="h-10 bg-neutral-100 rounded-xl" />
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'property' as const, label: 'Hostel', icon: Home },
            { id: 'campus' as const, label: 'Campus', icon: GraduationCap },
            { id: 'other' as const, label: 'Other', icon: MapPin },
          ].map((option) => {
            const Icon = option.icon
            const isActive = locationType === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setLocationType(option.id)}
                className={`flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{option.label}</span>
              </button>
            )
          })}
        </div>

        {locationType === 'property' && (
          <div className="relative">
            <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              required={locationType === 'property'}
            >
              <option value="">Select a property...</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name} {prop.neighborhood?.name ? `- ${prop.neighborhood.name}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {locationType === 'campus' && (
          <div className="relative">
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={selectedCampusId}
              onChange={(e) => setSelectedCampusId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              required={locationType === 'campus'}
            >
              <option value="">Select a campus...</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name} {campus.university?.name ? `(${campus.university.name})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {locationType === 'other' && (
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="Describe the location (e.g., near Main Library)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required={locationType === 'other'}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={detectLocation}
            disabled={detectingLocation}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <Navigation className="h-4 w-4" />
            <span className="text-xs font-bold">{detectingLocation ? 'Detecting...' : 'Auto-detect'}</span>
          </button>
          <button
            type="button"
            onClick={requestGpsLocation}
            disabled={detectingLocation}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-bold">Use GPS</span>
          </button>
        </div>
      </div>
    )
  }

  const renderUtilityTypeSection = () => {
    if (utilityTypesLoading) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-12 bg-neutral-100 rounded-xl" />
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {STANDARD_UTILITY_TYPES.map((type) => {
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
              <type.icon className="h-4 w-4" />
              <span className="text-sm font-bold">{type.label}</span>
            </button>
          )
        })}
        {dbUtilityTypes
          .filter((type) => !STANDARD_UTILITY_NAMES.has(type.name.toLowerCase()))
          .map((type) => {
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
                <Zap className="h-4 w-4" />
                <span className="text-sm font-bold">{type.name}</span>
              </button>
            )
          })}
        <button
          type="button"
          onClick={() => setUtilityType('other')}
          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
            utilityType === 'other'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm font-bold">Other</span>
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {success ? (
        <div className="text-center py-8 lg:py-12">
          <div className="h-16 w-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8" />
          </div>
          <p className="text-lg font-black text-neutral-900">Report Submitted</p>
          <p className="text-sm text-neutral-500 mt-1">Thank you for keeping the community informed.</p>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors text-sm font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Close
            </button>
          ) : (
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors text-sm font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop step indicator */}
          <div className="hidden md:flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Step {step} of 3</span>
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-6 rounded-full transition-all ${step >= 1 ? 'bg-primary' : 'bg-neutral-200'}`} />
              <div className={`h-1.5 w-6 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-neutral-200'}`} />
              <div className={`h-1.5 w-6 rounded-full transition-all ${step >= 3 ? 'bg-primary' : 'bg-neutral-200'}`} />
            </div>
          </div>

          {/* Mobile: single scrollable page */}
          <div className="md:hidden space-y-6">
            <div>
              <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                Select Issue Type
              </label>
              {renderUtilityTypeSection()}
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                WHAT ARE YOU REPORTING?
              </label>
              {renderLocationSection()}
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-4">
                Severity
              </label>
              <SeveritySlider value={severity} onChange={setSeverity} />
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the utility issue..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-24 overflow-y-auto"
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
          </div>

          {/* Desktop: 3-step wizard */}
          <div className="hidden md:block">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                    Select Issue Type
                  </label>
                  {renderUtilityTypeSection()}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (canGoNextStep1) setStep(2)
                  }}
                  disabled={!canGoNextStep1}
                  className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-tight hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                    WHAT ARE YOU REPORTING?
                  </label>
                  {renderLocationSection()}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (canGoNextStep2) setStep(3)
                  }}
                  disabled={!canGoNextStep2}
                  className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-tight hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-4">
                    Severity
                  </label>
                  <SeveritySlider value={severity} onChange={setSeverity} />
                </div>

                <div>
                  <label className="block text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the utility issue..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-24 overflow-y-auto"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 h-12 rounded-xl border border-neutral-200 bg-white text-neutral-700 font-bold text-sm uppercase tracking-tight hover:bg-neutral-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] h-12 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-tight hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </form>
  )
}
