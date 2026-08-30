import { HousingService } from '@/services/housing-service'
import { CommunityService } from '@/services/community-service'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Plus } from 'lucide-react'
import ReplyListClient from '@/components/community/reply-list-client'

export default async function PropertyDiscussionPage({ params }: { params: { id: string } }) {
  const property = await HousingService.getPropertyById(params.id)
  
  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Property not found.</p>
      </div>
    )
  }

  const neighborhoodId = property.neighborhood_id
  const discussions = neighborhoodId
    ? await CommunityService.getDiscussions({ neighborhoodId, limit: 50 })
    : []

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href={`/property/${property.id}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to property
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase">
                Discussion
              </h1>
              <p className="mt-2 text-neutral-500 text-lg">
                {property.name} • {discussions.length} discussion{discussions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Start Discussion
            </Button>
          </div>
        </div>

        {discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="bg-white rounded-3xl border border-neutral-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600 shrink-0">
                    {discussion.author?.full_name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 mb-1">{discussion.title}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                      {discussion.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <span>{discussion.author?.full_name || 'Anonymous'}</span>
                      <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                      {discussion.category && (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                          {discussion.category.name}
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      {/* Replies */}
                      <ReplyListClient discussionId={discussion.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
             <p className="text-neutral-500 text-lg">Nothing here yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
