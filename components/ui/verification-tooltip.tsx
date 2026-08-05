'use client'

import { ReactNode, useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationTooltipProps {
  level: string
  scoutName?: string
  auditDate?: string
  children: ReactNode
  className?: string
}

export function VerificationTooltip({
  level,
  scoutName,
  auditDate,
  children,
  className,
}: VerificationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const details = {
    unverified: 'No verification has been performed on this listing.',
    claimed: 'This listing has been claimed and verification is pending.',
    community_verified: 'Verified by student reviews and community feedback.',
    scout_verified: `Audited by scout ${scoutName || 'official'} on ${auditDate ? new Date(auditDate).toLocaleDateString() : 'recently'}.`,
    campozy_verified: 'Fully verified by Campozy. Includes scout audit, student reviews, and utility checks.',
  }

  return (
    <div
      className={cn('relative inline-flex items-center gap-1', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <button
        type="button"
        className="h-4 w-4 flex items-center justify-center text-neutral-400 hover:text-primary transition-colors"
        aria-label="Verification details"
        tabIndex={0}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-neutral-900 text-white text-sm rounded-2xl shadow-xl z-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="font-bold text-xs uppercase tracking-wider">{level.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-neutral-300 leading-relaxed">{details[level as keyof typeof details] || details.unverified}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-neutral-900" />
        </div>
      )}
    </div>
  )
}
