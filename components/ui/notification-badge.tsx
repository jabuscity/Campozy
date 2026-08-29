import * as React from 'react'

interface NotificationBadgeProps {
  count?: number
  className?: string
}

export function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (!count || count <= 0) return null

  return (
    <span
      className={`absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white ${className}`}
      aria-label={`${count} unread notifications`}
    />
  )
}
