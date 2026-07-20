import { cn } from '@/lib/utils'

interface FounderBadgeProps {
  scope: 'campus' | 'country' | 'global'
  className?: string
}

const config = {
  campus: {
    label: 'Campus Founder',
    className: 'bg-secondary text-white',
  },
  country: {
    label: 'Country Founder',
    className: 'bg-gradient-to-r from-secondary to-warning text-white',
  },
  global: {
    label: 'Global Pioneer',
    className: 'bg-gradient-to-r from-primary to-secondary text-white',
  },
}

export function FounderBadge({ scope, className }: FounderBadgeProps) {
  const cfg = config[scope]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight',
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  )
}
