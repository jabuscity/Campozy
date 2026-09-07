'use client'

import * as React from 'react'
import { PropertyCard } from '@/components/property-card'
import PropertyModal from '@/components/property-modal'
import type { Property } from '@/types'

export default function NeighborhoodPropertyGrid({
  properties,
}: {
  properties: Property[]
}) {
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string | null>(null)

  const sorted = React.useMemo(() => {
    return [...properties].sort((a, b) => (b.campozy_score || 0) - (a.campozy_score || 0))
  }, [properties])

  const currentIndex = sorted.findIndex(p => p.id === selectedPropertyId)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < sorted.length - 1

  function handlePrev() {
    if (hasPrev) {
      setSelectedPropertyId(sorted[currentIndex - 1].id)
    }
  }

  function handleNext() {
    if (hasNext) {
      setSelectedPropertyId(sorted[currentIndex + 1].id)
    }
  }

  return (
    <>
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((property, idx) => (
            <PropertyCard
              key={property.id}
              property={property}
              index={idx}
              variant="neighborhood"
              onClick={() => setSelectedPropertyId(property.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500">Nothing here yet.</p>
      )}
      <PropertyModal
        key={selectedPropertyId || 'closed'}
        isOpen={!!selectedPropertyId}
        onClose={() => setSelectedPropertyId(null)}
        propertyId={selectedPropertyId}
        properties={sorted}
        currentIndex={currentIndex}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  )
}
