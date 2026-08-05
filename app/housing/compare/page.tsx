'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HousingService } from '@/services/housing-service'
import { CampozyScore } from '@/components/ui/campozy-score'
import { UtilityMatrix } from '@/components/ui/utility-matrix'
import { ArrowLeft, MapPin, Trash2 } from 'lucide-react'
import Image from 'next/image'
import type { Property } from '@/types'

export default function ComparePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCompare() {
      const saved = localStorage.getItem('campozy_compare')
      if (saved) {
        try {
          const ids = JSON.parse(saved) as string[]
          if (ids.length > 0) {
            const data = await Promise.all(ids.map(id => HousingService.getPropertyById(id)))
            setProperties(data.filter(Boolean) as Property[])
          }
        } catch {
          // ignore
        }
      }
      setLoading(false)
    }

    loadCompare()
  }, [])

  const removeProperty = (id: string) => {
    const saved = localStorage.getItem('campozy_compare')
    if (saved) {
      const ids = JSON.parse(saved) as string[]
      const filtered = ids.filter((i: string) => i !== id)
      localStorage.setItem('campozy_compare', JSON.stringify(filtered))
      setProperties(prev => prev.filter(p => p.id !== id))
    }
  }

  const clearAll = () => {
    localStorage.removeItem('campozy_compare')
    setProperties([])
  }

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded-lg w-1/4" />
            <div className="h-64 bg-neutral-200 rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/housing" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Housing
          </Link>
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
            <h2 className="text-2xl font-black text-neutral-900 mb-4">No Properties to Compare</h2>
            <p className="text-neutral-500 mb-6">Save properties from the housing page to compare them side by side.</p>
            <Link href="/housing">
              <Button className="rounded-full font-bold">Browse Hostels</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-200 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight uppercase">Compare Hostels</h1>
              <p className="text-neutral-600">Side-by-side comparison of {properties.length} properties.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={clearAll} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" /> Clear All
              </Button>
              <Link href="/housing">
                <Button variant="secondary" className="rounded-full font-bold">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Housing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="relative h-48 bg-neutral-100">
                {property.property_media?.[0] ? (
                  <Image
                    src={property.property_media[0].url}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <MapPin className="h-12 w-12 text-neutral-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => removeProperty(property.id)}
                    className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">{property.name}</h3>
                    <p className="text-sm text-neutral-500">{property.neighborhoods?.name || 'Unknown area'}</p>
                  </div>
                  <CampozyScore score={property.campozy_score} size="sm" />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">Campozy Score</h4>
                    <CampozyScore score={property.campozy_score} size="lg" />
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">Utility Intelligence</h4>
                    <UtilityMatrix
                      items={[
                        { label: 'electricity', value: `${Math.round((property.utilities?.find(u => u.utility_type?.name?.toLowerCase() === 'electricity')?.reliability_score || 0) * 20)}% uptime`, status: 'good' },
                        { label: 'water', value: `${Math.round((property.utilities?.find(u => u.utility_type?.name?.toLowerCase() === 'water')?.reliability_score || 0) * 20)}% uptime`, status: 'good' },
                        { label: 'wifi', value: `${Math.round((property.utilities?.find(u => u.utility_type?.name?.toLowerCase() === 'internet')?.reliability_score || 0) * 20)}% uptime`, status: 'good' },
                      ]}
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-3">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Type</span>
                        <span className="font-bold text-neutral-900">{property.property_type?.name || 'Hostel'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Verification</span>
                        <Badge variant={property.verification_level === 'campozy_verified' ? 'success' : 'secondary'} className="text-xs">
                          {property.verification_level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Link href={`/property/${property.id}`} className="block mt-4">
                  <Button className="w-full rounded-full font-bold">View Full Report</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
