import { Zap, Droplet, Wifi, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UtilityItem {
  label: string
  value: string
  status: 'good' | 'warning' | 'bad'
}

interface UtilityMatrixProps {
  items: UtilityItem[]
  className?: string
}

const iconMap = {
  electricity: Zap,
  water: Droplet,
  wifi: Wifi,
  security: ShieldCheck,
}

const statusStyles = {
  good: 'text-success bg-success/5 border-success/20',
  warning: 'text-warning bg-warning/5 border-warning/20',
  bad: 'text-danger bg-danger/5 border-danger/20',
}

const statusDot = {
  good: 'bg-success',
  warning: 'bg-warning',
  bad: 'bg-danger',
}

export function UtilityMatrix({ items, className }: UtilityMatrixProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {items.map((item) => {
        const Icon = iconMap[item.label as keyof typeof iconMap] || Zap
        return (
          <div
            key={item.label}
            className={cn(
              'rounded-2xl border p-4 flex items-start gap-3',
              statusStyles[item.status]
            )}
          >
            <div className="mt-0.5">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-tight opacity-80 capitalize">
                {item.label}
              </p>
              <p className="text-sm font-medium text-neutral-900 mt-0.5 leading-snug">
                {item.value}
              </p>
            </div>
            <div className={cn('h-2 w-2 rounded-full mt-1.5 shrink-0', statusDot[item.status])} />
          </div>
        )
      })}
    </div>
  )
}
