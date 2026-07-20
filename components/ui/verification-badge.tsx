import { ShieldCheck, Shield, ShieldX } from 'lucide-react'
import { cn } from '@/lib/utils'

type VerificationLevel = 'unverified' | 'claimed' | 'community_verified' | 'scout_verified' | 'campozy_verified'

interface VerificationBadgeProps {
  level: VerificationLevel
  count?: number
  className?: string
}

const config = {
  unverified: {
    label: 'Unverified',
    className: 'border-dashed border-neutral-300 text-neutral-500 bg-neutral-50',
    icon: ShieldX,
  },
  claimed: {
    label: 'Claimed by Owner',
    className: 'border-primary/20 text-primary bg-primary/5',
    icon: Shield,
  },
  community_verified: {
    label: 'Community Verified',
    className: 'border-success/20 text-success bg-success/5',
    icon: ShieldCheck,
  },
  scout_verified: {
    label: 'Scout Audited',
    className: 'border-success/30 text-success bg-success/5',
    icon: ShieldCheck,
  },
  campozy_verified: {
    label: 'Campozy Certified',
    className: 'border-primary text-white bg-primary',
    icon: ShieldCheck,
  },
}

export function VerificationBadge({ level, count, className }: VerificationBadgeProps) {
  const cfg = config[level]
  const Icon = cfg.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
        cfg.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
      {count !== undefined && (
        <span className="ml-1 opacity-80">({count})</span>
      )}
    </span>
  )
}
