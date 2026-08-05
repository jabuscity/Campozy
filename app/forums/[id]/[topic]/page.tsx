import { ForumService } from '@/services/forum-service'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Clock } from 'lucide-react'

export default async function ForumTopicPage({ params }: { params: { id: string; topicId: string } }) {
  const topic = await ForumService.getTopicById(params.topicId)
  const posts = await ForumService.getPosts(params.topicId)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href={`/forums/${params.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to forum
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 p-8 mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">{topic.title}</h1>
            <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
              <Clock className="h-3 w-3" />
              <span>{new Date(topic.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
              {topic.author?.full_name?.[0] || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">{topic.author?.full_name || 'Unknown'}</p>
              <p className="text-xs text-neutral-500">{topic.author?.trust_level || 'Member'}</p>
            </div>
          </div>
          <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{topic.content}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> {posts.length} Replies
          </h2>

          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-black text-sm">
                      {post.author?.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{post.author?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-neutral-400">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200">
              <p className="text-neutral-500">No replies yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
