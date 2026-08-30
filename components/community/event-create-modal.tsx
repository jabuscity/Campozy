'use client'

import * as React from 'react'
import { X, CalendarPlus } from 'lucide-react'
import { createEventAction } from '@/app/actions/community-actions'

interface EventCreateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EventCreateModal({ isOpen, onClose }: EventCreateModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 max-h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 shrink-0">
          <h2 className="text-lg font-black text-neutral-900 uppercase">Create Event</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={createEventAction} className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Career Fair 2026"
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="What's this event about?"
              className="w-full px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Type</label>
            <select
              name="event_type"
              required
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Select type</option>
              <option value="academic">Academic</option>
              <option value="career">Career</option>
              <option value="social">Social</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Main Hall"
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Start</label>
              <input
                type="datetime-local"
                name="start_time"
                required
                className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">End</label>
              <input
                type="datetime-local"
                name="end_time"
                className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wide">Max Attendees</label>
            <input
              type="number"
              name="max_attendees"
              min="1"
              placeholder="Optional"
              className="w-full px-3 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <CalendarPlus className="h-4 w-4" />
            Create Event
          </button>
        </form>
      </div>
    </div>
  )
}
