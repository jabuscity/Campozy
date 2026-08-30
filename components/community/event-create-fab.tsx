'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { EventCreateModal } from './event-create-modal'

export function EventCreateButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-5 h-10 w-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-40 lg:hidden"
        aria-label="Create event"
      >
        <Plus className="h-5 w-5" />
      </button>

      <EventCreateModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
