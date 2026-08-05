import { CommunityService } from '@/services/community-service'
import { HousingService } from '@/services/housing-service'
import { OpportunityService } from '@/services/opportunity-service'
import { UtilityService } from '@/services/utility-service'
import { IdentityService } from '@/services/identity-service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Discussion, Opportunity, UtilityReport } from '@/types'
import { MessageSquare, AlertTriangle, Zap, Home, School, MapPin, ArrowRight } from 'lucide-react'

export default async function FeedPage() {
  const currentUser = await IdentityService.getCurrentUser()
  
  const [discussions, opportunities, reports] = await Promise.all([
    CommunityService.getDiscussions({ limit: 20 }).catch(() => [] as Discussion[]),
    OpportunityService.getOpportunities({ limit: 10 }).catch(() => [] as Opportunity[]),
    UtilityService.getRecentReports({ limit: 10 }).catch(() => [] as UtilityReport[]),
  ]).catch(() => [[], [], []])

  const feedItems = [
    ...(discussions || []).map((d) => ({
      type: 'discussion' as const,
      id: d.id,
      title: d.title,
      description: d.content,
      meta: `${d.author?.full_name || 'Anonymous'} • ${d.reply_count || 0} replies`,
      href: '/community',
      time: d.created_at,
    })),
    ...(reports || []).map((r) => ({
      type: 'report' as const,
      id: r.id,
      title: `${r.utility_type?.name || 'Utility'} Report`,
      description: r.comment || 'No details provided',
      meta: r.property?.name || 'General area',
      href: '/housing',
      time: r.created_at,
    })),
    ...(opportunities || []).map((o) => ({
      type: 'opportunity' as const,
      id: o.id,
      title: o.title,
      description: o.description,
      meta: `${o.type} • ${o.employer?.name || 'Campozy'}`,
      href: `/opportunities/${o.id}`,
      time: o.created_at,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20)

  const getSubtype = (type: string, meta: string): string => {
    if (type === 'opportunity') {
      return meta.split(' • ')[0].toLowerCase()
    }
    return type
  }

  const getPillVariant = (subtype: string): 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' => {
    switch (subtype) {
      case 'discussion': return 'default'
      case 'report': return 'warning'
      case 'job': return 'default'
      case 'internship': return 'info'
      case 'scholarship': return 'success'
      case 'volunteer': return 'danger'
      case 'event': return 'secondary'
      default: return 'secondary'
    }
  }

  const getPillText = (type: string, meta: string): string => {
    if (type === 'opportunity') {
      return meta.split(' • ')[0].toUpperCase()
    }
    return type.toUpperCase()
  }
  const getIcon = (type: string) => {
    switch (type) {
      case 'discussion': return <MessageSquare className="h-4 w-4" />
      case 'report': return <AlertTriangle className="h-4 w-4" />
      case 'opportunity': return <Zap className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'discussion': return 'bg-primary/10 text-primary'
      case 'report': return 'bg-warning/10 text-warning'
      case 'opportunity': return 'bg-secondary/10 text-secondary'
      default: return 'bg-neutral-100 text-neutral-600'
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-200 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
                Your Feed
              </h1>
              <p className="text-neutral-600 mt-2">
                Discussions, reports, opportunities, and updates from your campus.
              </p>
            </div>
            {currentUser && (
              <Link href="/community/ask">
                <Button className="rounded-full font-bold">New Post</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {feedItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
            <Zap className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-neutral-900 mb-2">No activity yet</h3>
            <p className="text-neutral-500">Check back later for updates from your campus.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedItems.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="block bg-white border border-neutral-200 rounded-xl p-4 md:p-5 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getPillVariant(getSubtype(item.type, item.meta))} className="text-[10px] font-black uppercase tracking-widest">
                        {getPillText(item.type, item.meta)}
                      </Badge>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {new Date(item.time).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-1 truncate">{item.title}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                    <p className="text-xs text-neutral-400 mt-2 font-medium">{item.meta}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-300 flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
