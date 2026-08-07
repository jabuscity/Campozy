'use client'

import * as React from 'react'

export function UniversityTicker() {
  const [universities, setUniversities] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

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
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 py-3 overflow-hidden">
      <div className="relative">
        <div className="flex whitespace-nowrap animate-ticker">
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
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .animate-ticker {
            animation: ticker 14s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}
