'use client'

import * as React from 'react'
import { X, Star, MapPin, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { UtilityMatrix } from '@/components/ui/utility-matrix'
import { Badge } from '@/components/ui/badge'
import type { Property } from '@/types'

interface PropertyModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string | null
  properties: Property[]
  currentIndex: number
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
}

export default function PropertyModal({ isOpen, onClose, propertyId, properties, currentIndex, hasPrev, hasNext, onPrev, onNext }: PropertyModalProps) {
  const [property, setProperty] = React.useState<Property | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSaved, setIsSaved] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen || !propertyId) return
    let cancelled = false

    async function loadProperty() {
      setLoading(true)
      try {
        const res = await fetch(`/api/properties/${encodeURIComponent(propertyId || '')}`)
        const data = await res.json()
        if (!cancelled) {
          if (data.property) setProperty(data.property)
          else setError('Property not found')
        }
      } catch {
        if (!cancelled) setError('Failed to load property')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProperty()
    return () => { cancelled = true }
  }, [isOpen, propertyId])

  React.useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isOpen])

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    if (target.scrollTop <= 0) {
      e.stopPropagation()
    }
  }

  if (!isOpen) return null

  const images = property?.media?.map(m => ({ url: m.url, alt: property.name })) || []
  const primaryImage = property?.media?.find(m => m.is_primary)?.url || property?.media?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200'
  const score = property?.campozy_score || 0
  const rating = (score / 20).toFixed(1)

   return (
     <div className="fixed inset-0 z-[60] flex items-center justify-center p-3">
       <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
       <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-neutral-900 uppercase tracking-tight">Hostel Details</h3>
            {properties.length > 1 && (
              <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                {currentIndex + 1} / {properties.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                isSaved ? 'text-red-500' : 'text-neutral-400 hover:text-red-500'
              }`}
              aria-label={isSaved ? 'Unsave property' : 'Save property'}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-16 w-16 flex items-center justify-center rounded-full bg-white text-neutral-700 hover:bg-primary hover:text-white active:bg-primary active:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
            aria-label="Previous property"
          >
            <span className="absolute" style={{ left: '25%', transform: 'translateX(-50%)' }}>
              <ChevronLeft className="h-6 w-6" />
            </span>
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 h-16 w-16 flex items-center justify-center rounded-full bg-white text-neutral-700 hover:bg-primary hover:text-white active:bg-primary active:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ clipPath: 'inset(0 0 0 50%)' }}
            aria-label="Next property"
          >
            <span className="absolute" style={{ left: '75%', transform: 'translateX(-50%)' }}>
              <ChevronRight className="h-6 w-6" />
            </span>
          </button>
        )}

        <div className="px-5 py-4 overflow-y-auto overscroll-contain" onScroll={handleContentScroll}>
          {loading && <div className="text-neutral-500 text-center py-12">Loading...</div>}
          {error && <div className="text-red-500 text-center py-12">{error}</div>}
          {!loading && !error && property && (
            <div className="space-y-6">
              <ImageCarousel
                images={images.length > 0 ? images : [{ url: primaryImage, alt: property.name }]}
                aspectRatio="wide"
                className="rounded-xl"
              />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{property.name}</h2>
                  <div className="flex items-center gap-2 text-neutral-500 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{property.neighborhood?.name || property.neighborhoods?.name || 'Unknown area'}, {property.address}</span>
                  </div>
                  {property.updated_at && (
                    <p className="text-xs text-neutral-400 mt-1">Last updated: {new Date(property.updated_at).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-bold">
                    {property.property_type?.name || 'Hostel'}
                  </Badge>
                  <div className="flex items-center gap-1 bg-neutral-100 rounded-full px-2.5 py-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-neutral-900">{rating}</span>
                  </div>
                </div>
              </div>

              {property.description && (
                <div>
                  <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-2">Overview</h4>
                  <p className="text-neutral-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {(property.monthly_price || property.profiles?.phone_number) && (
                <div>
                  <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-3">Pricing & Contact</h4>
                  <div className="flex flex-row rounded-xl overflow-hidden border border-primary">
                    {property.monthly_price && (
                      <div className="flex-1 min-w-0 bg-primary text-white p-5">
                        <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">Monthly Price</p>
                        <p className="text-3xl font-black text-white leading-none">KES {property.monthly_price.toLocaleString()}</p>
                        <p className="text-sm text-white/80 mt-1">per month</p>
                      </div>
                    )}
                    {(property.monthly_price && property.profiles?.phone_number) && (
                      <div className="w-px bg-primary/20 shrink-0" />
                    )}
                    {property.profiles?.phone_number && (
                      <div className="flex-1 min-w-0 bg-primary/5 p-5">
                        <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Owner Contact</p>
                        <p className="text-sm font-bold text-neutral-900">{property.profiles.phone_number}</p>
                        <p className="text-xs text-neutral-500">{property.profiles.full_name || property.profiles.username || 'Property owner'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span key={amenity.amenity_id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-bold border border-primary/10">
                        {amenity.amenity_type?.name || 'Amenity'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {property.utilities && property.utilities.length > 0 && (
                <div>
                  <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-3">Utility Intelligence</h4>
                  <UtilityMatrix
                    items={[
                      { label: 'electricity', value: `Reliability: ${Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'electricity')?.reliability_score || 0)}%`, status: Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'electricity')?.reliability_score || 0) < 40 ? 'bad' : Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'electricity')?.reliability_score || 0) < 70 ? 'warning' : 'good', rating: Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'electricity')?.reliability_score || 0) },
                      { label: 'water', value: `Reliability: ${Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'water')?.reliability_score || 0)}%`, status: Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'water')?.reliability_score || 0) < 40 ? 'bad' : Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'water')?.reliability_score || 0) < 70 ? 'warning' : 'good', rating: Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'water')?.reliability_score || 0) },
                      { label: 'internet', value: `Reliability: ${Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'internet')?.reliability_score || 0)}%`, status: Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'internet')?.reliability_score || 0) < 40 ? 'bad' : Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'internet')?.reliability_score || 0) < 70 ? 'warning' : 'good', rating: Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'internet')?.reliability_score || 0) },
                      { label: 'security', value: `Safety score: ${Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'security')?.reliability_score || 0)}%`, status: Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'security')?.reliability_score || 0) < 40 ? 'bad' : Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'security')?.reliability_score || 0) < 70 ? 'warning' : 'good', rating: Math.round(property.utilities.find(u => u.utility_type?.name?.toLowerCase() === 'security')?.reliability_score || 0) },
                    ]}
                  />
                </div>
              )}

              {property.rooms && property.rooms.length > 0 && (
                <div>
                  <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-3">Available Units</h4>
                  <div className="space-y-2">
                    {property.rooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                        <div>
                          <p className="font-bold text-neutral-900">{room.room_type}</p>
                          <p className="text-xs text-neutral-500">Capacity: {room.capacity} student{room.capacity > 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-neutral-900">KES {room.price_per_month?.toLocaleString() || 'N/A'}</p>
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">per month</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(property.pros || property.known_issues) && (
                <div>
                  <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-3">Highlights & Notes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.pros && (
                      <div className="p-4 rounded-xl border border-green-200 bg-green-50">
                        <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-2">Pros</p>
                        <ul className="space-y-1">
                          {property.pros.split('\n').filter(Boolean).map((item, idx) => (
                            <li key={idx} className="text-sm text-green-900 leading-snug">• {item.replace(/^•\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {property.known_issues && (
                      <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                        <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-2">Known Issues</p>
                        <ul className="space-y-1">
                          {property.known_issues.split('\n').filter(Boolean).map((item, idx) => (
                            <li key={idx} className="text-sm text-red-900 leading-snug">• {item.replace(/^•\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
