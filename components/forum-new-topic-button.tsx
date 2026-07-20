'use client'

import * as React from 'react'
import { NewTopicModal } from '@/components/new-topic-modal'

export function ForumNewTopicButton({ forumId }: { forumId: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="shrink-0 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-all"
      >
        New Topic
      </button>
      <NewTopicModal isOpen={isOpen} onClose={() => setIsOpen(false)} forumId={forumId} />
    </>
  )
}
