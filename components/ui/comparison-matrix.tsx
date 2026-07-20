import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CampozyScore } from '@/components/ui/campozy-score'
import { VerificationBadge } from '@/components/ui/verification-badge'
import type { VerificationLevel } from '@/components/ui/verification-badge'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComparisonProperty {
  id: string
  name: string
  price_per_month: number
  campozy_score: number
  verification_level: string
  property_type?: { name: string }
  neighborhood?: { name: string }
  rooms?: { room_type: string; price_per_month: number; capacity: number }[]
}

interface ComparisonMatrixProps {
  properties: ComparisonProperty[]
  onRemove: (id: string) => void
  className?: string
}

export function ComparisonMatrix({ properties, onRemove, className }: ComparisonMatrixProps) {
  if (properties.length === 0) return null

  const maxRooms = Math.max(...properties.map(p => p.rooms?.length || 0), 1)

  return (
    <div className={cn('bg-white rounded-3xl border border-neutral-200 overflow-hidden', className)}>
      <div className="p-6 border-b border-neutral-100">
        <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
          Compare Properties ({properties.length}/3)
        </h2>
        <p className="text-sm text-neutral-500 mt-1">Side-by-side comparison to help you decide.</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header Row */}
          <div className="grid grid-cols-4 border-b border-neutral-100">
            <div className="p-4 text-sm font-bold text-neutral-500 uppercase tracking-tight">Feature</div>
            {properties.map((property) => (
              <div key={property.id} className="p-4 relative">
                <button
                  onClick={() => onRemove(property.id)}
                  className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition-colors"
                >
                  ×
                </button>
                <Link href={`/property/${property.id}`} className="block hover:text-primary transition-colors">
                  <h3 className="font-bold text-neutral-900 leading-snug">{property.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{property.neighborhood?.name}</p>
                </Link>
              </div>
            ))}
          </div>

          {/* Campozy Score Row */}
          <div className="grid grid-cols-4 border-b border-neutral-100">
            <div className="p-4 text-sm font-bold text-neutral-500 uppercase tracking-tight">Campozy Score</div>
            {properties.map((property) => (
              <div key={property.id} className="p-4 flex justify-center">
                <CampozyScore score={property.campozy_score} size="sm" showLabel={false} />
              </div>
            ))}
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-4 border-b border-neutral-100">
            <div className="p-4 text-sm font-bold text-neutral-500 uppercase tracking-tight">Price/month</div>
            {properties.map((property) => (
              <div key={property.id} className="p-4">
                <p className="text-lg font-black text-neutral-900">KES {property.price_per_month?.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Verification Row */}
          <div className="grid grid-cols-4 border-b border-neutral-100">
            <div className="p-4 text-sm font-bold text-neutral-500 uppercase tracking-tight">Verification</div>
            {properties.map((property) => (
              <div key={property.id} className="p-4 flex justify-center">
                <VerificationBadge level={property.verification_level as VerificationLevel} />
              </div>
            ))}
          </div>

          {/* Rooms Row */}
          {Array.from({ length: maxRooms }).map((_, roomIndex) => (
            <div key={roomIndex} className="grid grid-cols-4 border-b border-neutral-100 last:border-b-0">
              <div className="p-4 text-sm font-bold text-neutral-500 uppercase tracking-tight">
                Room {roomIndex + 1}
              </div>
              {properties.map((property) => {
                const room = property.rooms?.[roomIndex]
                return (
                  <div key={property.id} className="p-4">
                    {room ? (
                      <div>
                        <p className="font-bold text-neutral-900">{room.room_type}</p>
                        <p className="text-sm text-neutral-500">KES {room.price_per_month?.toLocaleString()}/mo</p>
                        <p className="text-xs text-neutral-400">Capacity: {room.capacity}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400">-</p>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Actions Row */}
          <div className="grid grid-cols-4 border-t border-neutral-100 bg-neutral-50">
            <div className="p-4 text-sm font-bold text-neutral-500 uppercase tracking-tight">Action</div>
            {properties.map((property) => (
              <div key={property.id} className="p-4">
                <Link href={`/property/${property.id}`}>
                  <Button size="sm" className="w-full">
                    View Details <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
