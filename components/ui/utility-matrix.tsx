import { Zap, Droplet, Wifi, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UtilityItem {
  label: string
  value: string
  status: 'good' | 'warning' | 'bad'
  rating?: number
}

interface UtilityMatrixProps {
  items: UtilityItem[]
  className?: string
}

const iconMap = {
  electricity: Zap,
  water: Droplet,
  wifi: Wifi,
  internet: Wifi,
  security: ShieldCheck,
}

const statusStyles = {
  good: 'text-success bg-success/5 border-success/20',
  warning: 'text-warning bg-warning/5 border-warning/20',
  bad: 'text-danger bg-danger/5 border-danger/20',
}

const statusFill = {
  good: 'bg-success/10',
  warning: 'bg-warning/10',
  bad: 'bg-danger/10',
}

const statusDot = {
  good: 'bg-success',
  warning: 'bg-warning',
  bad: 'bg-danger',
}

export function UtilityMatrix({ items, className }: UtilityMatrixProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {items.map((item) => {
        const Icon = iconMap[item.label as keyof typeof iconMap] || Zap
        const fillWidth = typeof item.rating === 'number' ? Math.min(100, Math.max(0, item.rating)) : 0
        const hue = fillWidth * 1.2
        const fillColor = `hsla(${hue}, 70%, 50%, 0.12)`
        return (
          <div
            key={item.label}
            className={cn(
              'relative overflow-hidden rounded-xl border p-2.5 flex items-start gap-2.5',
              statusStyles[item.status]
            )}
          >
            <div
              className="absolute inset-y-0 left-0"
              style={{ width: `${fillWidth}%`, backgroundColor: fillColor }}
            />
            <div className="relative mt-0.5">
              <Icon className="h-4 w-4" />
            </div>
            <div className="relative flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-tight opacity-80 capitalize">
                {item.label}
              </p>
              <p className="text-xs font-medium text-neutral-900 mt-0.5 leading-snug">
                {item.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
