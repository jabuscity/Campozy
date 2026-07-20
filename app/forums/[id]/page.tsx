import { ForumService } from '@/services/forum-service'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { ForumNewTopicButton } from '@/components/forum-new-topic-button'

export default async function ForumPage({ params }: { params: { id: string } }) {
  const forum = await ForumService.getForumById(params.id)
  const topics = await ForumService.getTopics(params.id, { limit: 30 })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
                {forum.name}
              </h1>
              <p className="mt-2 text-neutral-500 text-lg">
                {forum.description || 'Forum discussions'}
              </p>
            </div>
            <ForumNewTopicButton forumId={forum.id} />
          </div>
        </div>

        {topics.length > 0 ? (
          <div className="space-y-4">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/forums/${params.id}/${topic.id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md hover:border-primary transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.is_pinned && (
                        <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full">Pinned</span>
                      )}
                      {topic.is_locked && (
                        <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">Locked</span>
                      )}
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-1">{topic.title}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2">{topic.content}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400 shrink-0">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{topic.reply_count}</span>
                    </div>
                    <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No topics yet.</p>
            <ForumNewTopicButton forumId={forum.id} />
          </div>
        )}
      </div>
    </div>
  )
}
