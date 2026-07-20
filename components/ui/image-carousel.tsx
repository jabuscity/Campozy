'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageCarouselProps {
  images: { url: string; alt?: string }[]
  className?: string
  aspectRatio?: 'square' | 'video' | 'wide'
}

export function ImageCarousel({ images, className, aspectRatio = 'wide' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const aspectRatios = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  }

  const goTo = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, images.length - 1))
    setCurrentIndex(newIndex)
    setDragOffset(0)
  }, [images.length])

  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex])
  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex])

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStart(clientX)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const offset = clientX - dragStart
    setDragOffset(offset)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    const threshold = 50
    if (dragOffset > threshold) {
      goPrev()
    } else if (dragOffset < -threshold) {
      goNext()
    } else {
      setDragOffset(0)
    }
    setIsDragging(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, images.length, goNext, goPrev])

  if (!images.length) return null

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden rounded-3xl bg-neutral-100', aspectRatios[aspectRatio], className)}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="relative h-full w-full shrink-0">
            <Image
              src={image.url}
              alt={image.alt || `Image ${index + 1}`}
              fill
              sizes="(min-width: 1024px) 100vw, 100vw"
              className="object-cover pointer-events-none"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                currentIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-bold backdrop-blur-md">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
