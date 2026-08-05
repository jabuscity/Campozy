'use client'

import * as React from 'react'
import Image from 'next/image'

interface TileImageWithFallbackProps {
  src: string
  alt: string
  fallbackIcon: React.ReactNode
}

export function TileImageWithFallback({ src, alt, fallbackIcon }: TileImageWithFallbackProps) {
  const [failed, setFailed] = React.useState(false)

  if (failed) {
    return (
      <div className="h-full w-full flex items-center justify-center text-neutral-400">
        {fallbackIcon}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      onError={() => setFailed(true)}
    />
  )
}
