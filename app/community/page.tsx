import { CommunityService } from '@/services/community-service'
import { HousingService } from '@/services/housing-service'
import { Button } from '@/components/ui/button'
import { DiscussionCard } from '@/components/ui/discussion-card'
import { PenSquare, Users, ArrowRight, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import type { Discussion } from '@/types'
import { CommunityMobileTabs } from '@/components/community/community-mobile-tabs'

export default async function CommunityPage() {
  const discussions = await CommunityService.getDiscussions({ limit: 20 }).catch(() => [] as Discussion[])
  const campuses = await HousingService.getCampuses().catch(() => [] as { id: string; name: string }[])

  const trendingDiscussions = (discussions || []).slice(0, 5)

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Mobile: Tabbed Discussions + Connections */}
      <CommunityMobileTabs discussions={discussions} />

      {/* Desktop: Discussions + Connections */}
      <div className="hidden lg:block">
        <div className="bg-white border-b border-neutral-200 py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight uppercase italic">Student Community</h1>
                <p className="text-neutral-600">
                  Ask questions, share tips, and connect with students who share your interests.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/community">
                  <Button size="lg" className="rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 h-14 px-8">
                    <MessageCircle className="h-5 w-5" /> Discussions
                  </Button>
                </Link>
                <Link href="/connections">
                  <Button size="lg" variant="outline" className="rounded-2xl gap-2 font-bold h-14 px-8">
                    <Users className="h-5 w-5" /> Connections
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Trending Discussions</h2>
              <div className="space-y-4">
                {trendingDiscussions.map((discussion) => (
                  <DiscussionCard
                    key={discussion.id}
                    id={discussion.id}
                    title={discussion.title}
                    content={discussion.content}
                    authorName={discussion.author?.full_name || 'Anonymous'}
                    createdAt={discussion.created_at}
                    commentCount={discussion.reply_count || 0}
                    categoryName={discussion.category?.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Top Connections</h2>
                <Link href="/connections">
                  <Button variant="ghost" className="text-primary font-bold text-sm">
                    See all <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center">
                <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-neutral-900 mb-2">Discover Your People</h3>
                <p className="text-neutral-500 mb-6 text-sm">Browse students at your institution and see your compatibility scores.</p>
                <Link href="/connections">
                  <Button className="rounded-full font-bold">Browse Connections</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
