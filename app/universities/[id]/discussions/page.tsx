import { CommunityService } from '@/services/community-service'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function UniversityDiscussionsPage({ params }: { params: { id: string } }) {
  const campusId = params.id
  const discussions = await CommunityService.getDiscussions({ campusId, limit: 20 })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
            Discussions
          </h1>

        </div>

        {discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Link
                key={discussion.id}
                href={`/community`}
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md hover:border-primary transition-all"
              >
                <h3 className="font-bold text-neutral-900 mb-2">{discussion.title}</h3>
                <p className="text-sm text-neutral-500 line-clamp-3 mb-3">{discussion.content}</p>
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <span>{discussion.author?.full_name || 'Anonymous'}</span>
                  <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">Nothing here yet.</p>
            <Link href="/community" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Browse all discussions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
