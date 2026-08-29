'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onSubmit: (content: string) => Promise<void> | void
  placeholder?: string
}

export default function ReplyEditor({ onSubmit, placeholder = 'Write a reply...' }: Props) {
  const [content, setContent] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    try {
      await onSubmit(content.trim())
      setContent('')
    } catch (err) {
      // swallow - caller handles errors
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[80px] rounded-xl border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setContent('')} disabled={saving}>Cancel</Button>
        <Button type="submit" size="sm" className="font-bold" disabled={saving || !content.trim()}>
          {saving ? 'Posting...' : 'Post Reply'}
        </Button>
      </div>
    </form>
  )
}
