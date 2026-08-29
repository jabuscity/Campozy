'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { HousingService } from '@/services/housing-service'
import { BentoGrid } from '@/components/bento-grid'
import { PropertyCard } from '@/components/property-card'
import { Heart, Trash2, MapPin } from 'lucide-react'
import { removeSavedPropertyAction } from '@/app/actions/housing-actions'

interface SavedPropertyItem {
  property_id: string
  notes?: string
  saved_at?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any
}

interface NeighborhoodWithCount {
  neighborhood: {
    id: string
    name: string
    description: string | null
    reputation_score: number | null
    image_url: string | null
    cities?: {
      name?: string
      countries?: { name?: string }
    }
  }
  propertyCount: number
}

interface NeighborhoodsClientProps {
  neighborhoods: NeighborhoodWithCount[]
}

export function NeighborhoodsClient({ neighborhoods }: NeighborhoodsClientProps) {
  const [activeTab, setActiveTab] = useState<'neighborhoods' | 'saved'>('neighborhoods')
  const [savedProperties, setSavedProperties] = React.useState<SavedPropertyItem[]>([])
  const [savedLoading, setSavedLoading] = useState(false)

  const loadSavedProperties = async () => {
    setSavedLoading(true)
    try {
      const data = await HousingService.getSavedProperties()
      setSavedProperties((data || []) as SavedPropertyItem[])
    } catch {
      setSavedProperties([])
    } finally {
      setSavedLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'saved') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadSavedProperties()
    }
  }, [activeTab])

  return (
    <div>
      <div className="mb-8 md:mb-10">
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-blue-100 rounded-3xl p-1">
            <button
              onClick={() => setActiveTab('neighborhoods')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'neighborhoods'
                  ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Neighborhoods
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'saved'
                  ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Heart className="h-4 w-4" />
              Saved
            </button>
          </div>
        </div>

        {activeTab === 'neighborhoods' && (
          <>
            {neighborhoods.length > 0 ? (
              <BentoGrid neighborhoods={neighborhoods} />
            ) : (
              <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-neutral-200">
                <p className="text-neutral-500 text-base md:text-lg">None yet.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <div className="max-w-7xl mx-auto">
            {savedLoading ? (
              <div className="text-center py-12">
                <p className="text-neutral-500">Loading saved properties...</p>
              </div>
            ) : savedProperties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
                <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-neutral-900 mb-2">No saved properties yet</h3>
                <p className="text-neutral-500 mb-6">Start exploring hostels and save the ones you like.</p>
                <button onClick={() => setActiveTab('neighborhoods')} className="rounded-full font-bold bg-primary text-white px-6 py-2">
                  Find Hostels
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {savedProperties.map((saved) => (
                  <div key={saved.property_id} className="relative">
                    {saved.properties ? (
                      <>
                        <PropertyCard property={saved.properties} />
                        <form action={removeSavedPropertyAction} className="absolute top-3 right-3">
                          <input type="hidden" name="propertyId" value={saved.property_id} />
                          <button
                            type="submit"
                            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
