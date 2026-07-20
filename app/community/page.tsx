import { CommunityService } from '@/services/community-service'
import { HousingService } from '@/services/housing-service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DiscussionCard } from '@/components/ui/discussion-card'
import { 
  Users, TrendingUp, PenSquare, Hash, MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const category = searchParams.category
  const discussions = await CommunityService.getDiscussions(category ? { categoryId: category } : {})
  const campuses = await HousingService.getCampuses()

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Community Header */}
      <div className="bg-white border-b border-neutral-200 py-12">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="max-w-xl text-center md:text-left mx-auto md:mx-0">
                  <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight uppercase italic">The Campus Feed</h1>
                  <p className="text-neutral-500 text-lg font-medium leading-relaxed">
                    Real-time discussions, neighborhood alerts, and campus-verified hacks.
                  </p>
               </div>
               
               <div className="flex justify-center md:justify-end gap-3">
                  <Button 
                    size="lg" 
                    className="rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 h-14 px-8"
                    onClick={() => redirect("/community/new")}
                  >
                    <PenSquare className="h-5 w-5" /> Start Discussion
                  </Button>
               </div>
            </div>
         </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-4 gap-12">
        {/* Sidebar: Navigation & Filters */}
        <div className="hidden lg:block space-y-8">
           <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
             <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-6">Categories</h3>
             <nav className="space-y-1">
                <CategoryLink icon={<Hash className="h-4 w-4" />} label="General" categoryId="general" currentCategory={category} />
                <CategoryLink icon={<MessageCircle className="h-4 w-4" />} label="Housing & Hostels" categoryId="housing" currentCategory={category} />
                <CategoryLink icon={<TrendingUp className="h-4 w-4" />} label="Marketplace" categoryId="marketplace" currentCategory={category} />
                <CategoryLink icon={<Users className="h-4 w-4" />} label="Opportunities" categoryId="opportunities" currentCategory={category} />
             </nav>
           </div>

           <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-6">Trending Campuses</h3>
              <div className="space-y-4">
                 {campuses.slice(0, 5).map(campus => (
                   <div key={campus.id} className="flex items-center justify-between group cursor-pointer hover:bg-neutral-50 p-2 rounded-xl transition-colors">
                      <span className="font-bold text-neutral-700 text-sm">{campus.name}</span>
                      <Badge variant="outline" className="text-[10px]">Active</Badge>
                   </div>
                 ))}
              </div>
           </div>
        </div>

         {/* Main Feed */}
         <div className="lg:col-span-3 space-y-6">
            {/* Discussion Cards */}
            {discussions.length > 0 ? discussions.map(discussion => (
              <DiscussionCard
                key={discussion.id}
                id={discussion.id}
                title={discussion.title}
                content={discussion.content}
                authorName={discussion.author?.full_name || 'Student Anonymous'}
                createdAt={discussion.created_at}
                upvotes={discussion.view_count || 0}
                commentCount={discussion.reply_count || 0}
                categoryName={discussion.category?.name}
              />
            )) : (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-neutral-100">
                 <h3 className="text-xl font-bold text-neutral-900 mb-2">The feed is quiet...</h3>
                 <p className="text-neutral-500">Be the first to share an update about your campus!</p>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}

function CategoryLink({ icon, label, categoryId, currentCategory }: { icon: React.ReactNode, label: string, categoryId: string, currentCategory: string | undefined }) {
  const active = currentCategory === categoryId || (!currentCategory && categoryId === "general")

  return (
    <Link 
      href={`/community?${new URLSearchParams({ category: categoryId }).toString()}`}
      className={cn(
       "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
       active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-neutral-500 hover:bg-neutral-50"
    )}>
       {icon}
       {label}
    </Link>
  )
}
