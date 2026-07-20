import { cn } from '@/lib/utils'
import { Zap, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface FeedItem {
  id: string
  type: 'utility' | 'scout_report' | 'warning' | 'success'
  title: string
  description: string
  timestamp: string
  link?: string
}

interface RealTimeFeedProps {
  items: FeedItem[]
  className?: string
}

const iconMap = {
  utility: Zap,
  scout_report: ShieldCheck,
  warning: AlertTriangle,
  success: CheckCircle2,
}

const colorMap = {
  utility: 'text-primary bg-primary/5 border-primary/20',
  scout_report: 'text-success bg-success/5 border-success/20',
  warning: 'text-warning bg-warning/5 border-warning/20',
  success: 'text-success bg-success/5 border-success/20',
}

export function RealTimeFeed({ items, className }: RealTimeFeedProps) {
  if (!items.length) return null

  return (
    <div className={cn('bg-white rounded-3xl border border-neutral-200 overflow-hidden', className)}>
      <div className="p-6 border-b border-neutral-100">
        <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Live Feed</h2>
        <p className="text-sm text-neutral-500 mt-1">Real-time community reports and scout updates.</p>
      </div>

      <div className="divide-y divide-neutral-100">
        {items.map((item) => {
          const Icon = iconMap[item.type]
          const colors = colorMap[item.type]
          const content = (
            <div className="p-4 flex items-start gap-4 hover:bg-neutral-50 transition-colors">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', colors)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-neutral-900 text-sm leading-tight">{item.title}</h4>
                  <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
              </div>
            </div>
          )

          if (item.link) {
            return (
              <Link key={item.id} href={item.link} className="block">
                {content}
              </Link>
            )
          }

          return <div key={item.id}>{content}</div>
        })}
      </div>
    </div>
  )
}
