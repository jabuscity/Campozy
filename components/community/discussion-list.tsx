'use client'

import * as React from 'react'
import { DiscussionCard } from '@/components/ui/discussion-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Discussion } from '@/types'

interface Props {
  discussions: Discussion[]
  className?: string
  ctaPath?: string
}

export default function DiscussionList({ discussions, className = '', ctaPath }: Props) {
  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              id={discussion.id}
              title={discussion.title}
              content={discussion.content}
              authorName={discussion.author?.full_name || 'Anonymous'}
              createdAt={discussion.created_at}
              commentCount={discussion.reply_count || 0}
              className="hover:border-blue-400 hover:bg-blue-50 hover:shadow-blue-200/60 transition-colors"
            />
          ))}
        </div>

        {discussions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500">No discussions yet.</p>
            {ctaPath && (
              <Link href={ctaPath}>
                <Button className="mt-4 rounded-full font-bold">Start a Discussion</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
