'use client'

import * as React from 'react'

const PIXELS_PER_SECOND_DESKTOP = 40
const PIXELS_PER_SECOND_MOBILE = 20

function getPixelsPerSecond() {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768 ? PIXELS_PER_SECOND_MOBILE : PIXELS_PER_SECOND_DESKTOP
  }
  return PIXELS_PER_SECOND_DESKTOP
}

export function UniversityTicker() {
  const [universities, setUniversities] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isPaused, setIsPaused] = React.useState(false)
  const [pixelsPerSecond, setPixelsPerSecond] = React.useState(getPixelsPerSecond)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const rafRef = React.useRef<number | null>(null)
  const lastTimeRef = React.useRef<number>(0)
  const positionRef = React.useRef(0)

  React.useEffect(() => {
    fetch('/api/universities')
      .then(res => res.json())
      .then(data => {
        if (data.universities && data.universities.length > 0) {
          setUniversities(data.universities)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  React.useEffect(() => {
    const handleResize = () => {
      setPixelsPerSecond(getPixelsPerSecond())
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    if (universities.length === 0 || !contentRef.current || !scrollRef.current) return

    const content = contentRef.current
    const singleSetWidth = content.scrollWidth / 2

    lastTimeRef.current = 0
    positionRef.current = 0

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const delta = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      if (!isPaused) {
        positionRef.current -= pixelsPerSecond * delta

        if (Math.abs(positionRef.current) >= singleSetWidth) {
          positionRef.current += singleSetWidth
        }

        content.style.transform = `translateX(${positionRef.current}px)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [universities, isPaused, pixelsPerSecond])

  if (isLoading) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 py-3">
        <div className="flex whitespace-nowrap">
          <span className="mx-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Loading universities...</span>
        </div>
      </div>
    )
  }

  const repeated = [...universities, ...universities]

  return (
    <div
      className="w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 py-3 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div ref={scrollRef} className="relative overflow-hidden">
        <div
          ref={contentRef}
          className="flex whitespace-nowrap will-change-transform items-center"
          style={{ transform: 'translateX(0px)' }}
        >
          {repeated.map((name, i) => (
            <React.Fragment key={`${name}-${i}`}>
              {i > 0 && (
                <span className="text-neutral-300 mx-2 sm:mx-3 text-[11px] sm:text-xs select-none">•</span>
              )}
              <span className="text-[13px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                {name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
