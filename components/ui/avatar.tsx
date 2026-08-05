import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  className?: string
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex items-center justify-center rounded-full bg-neutral-200 overflow-hidden', className)}>
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-neutral-500 uppercase">
          {(fallback || alt || '?')[0]}
        </span>
      )}
    </div>
  )
}
