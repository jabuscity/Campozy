'use client'

import * as React from 'react'

const PIXELS_PER_SECOND = 40

export function UniversityTicker() {
  const [universities, setUniversities] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [duration, setDuration] = React.useState(40)
  const tickerRef = React.useRef<HTMLDivElement>(null)

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
    if (universities.length === 0 || !tickerRef.current) return

    const measure = () => {
      if (!tickerRef.current) return
      const contentWidth = tickerRef.current.scrollWidth
      const halfWidth = contentWidth / 2
      const calculated = Math.max(20, halfWidth / PIXELS_PER_SECOND)
      setDuration(calculated)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [universities])

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
  const animationStyle: React.CSSProperties = {
    animation: `ticker ${duration}s linear infinite`,
  }

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 py-3 overflow-hidden">
      <div className="relative">
        <div ref={tickerRef} className="flex whitespace-nowrap" style={animationStyle}>
          {repeated.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="mx-6 text-xs font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
