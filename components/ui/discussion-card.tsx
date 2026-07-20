import { MessageSquare, ArrowUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface DiscussionCardProps {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: string
  upvotes?: number
  commentCount: number
  categoryName?: string
  className?: string
}

export function DiscussionCard({
  id,
  title,
  content,
  authorName,
  createdAt,
  upvotes,
  commentCount,
  categoryName,
  className,
}: DiscussionCardProps) {
  return (
    <Link
      href={`/community?discussion=${id}`}
       className={cn(
         'block bg-white rounded-2xl border border-neutral-200 p-4 md:p-5 hover:border-primary hover:shadow-md transition-all',
         className
       )}
    >
      <div className="flex items-start gap-4">
        {upvotes !== undefined && (
          <div className="flex flex-col items-center gap-1 pt-1">
            <ArrowUp className="h-5 w-5 text-neutral-400" />
            <span className="text-sm font-bold text-neutral-700">{upvotes}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {categoryName && (
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-tight">
                {categoryName}
              </span>
            )}
          </div>
          <h3 className="font-bold text-neutral-900 mb-1 leading-snug">{title}</h3>
          <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{content}</p>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="font-medium text-neutral-600">{authorName}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
