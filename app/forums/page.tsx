import { ForumService } from '@/services/forum-service'
import Link from 'next/link'
import { MessageSquare, Users } from 'lucide-react'

export default async function ForumsPage({
  searchParams,
}: {
  searchParams: { campus?: string; neighborhood?: string }
}) {
  const forums = await ForumService.getForums({
    campusId: searchParams.campus,
    neighborhoodId: searchParams.neighborhood,
    limit: 50,
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Forums
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Campus and neighborhood discussions
          </p>
        </div>

        {forums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forums.map((forum) => (
              <Link
                key={forum.id}
                href={`/forums/${forum.id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:border-primary transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{forum.name}</h3>
                    <p className="text-xs text-neutral-500 uppercase tracking-tight">
                      {forum.is_public ? 'Public' : 'Private'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{forum.description || 'No description'}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Users className="h-3 w-3" />
                  <span>Created by {forum.created_by_profile?.full_name || 'Unknown'}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">No forums yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
