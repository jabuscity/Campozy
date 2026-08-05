'use client'

import { useEffect, useMemo, useState } from 'react'
import { NeighborhoodCard } from '@/components/neighborhood-card'
import { generateLayout } from '@/lib/bento-layout-engine'

interface NeighborhoodWithCount {
  neighborhood: {
    id: string
    name: string
    description: string | null
    reputation_score: number | null
    image_url: string | null
    cities?: {
      name?: string
      countries?: { name?: string }
    }
  }
  propertyCount: number
}

export function BentoGrid({ neighborhoods }: { neighborhoods: NeighborhoodWithCount[] }) {
  const [cols, setCols] = useState(4)
  const [distribution, setDistribution] = useState<'mobile' | 'desktop'>('desktop')

  const layout = useMemo(() => generateLayout({ count: neighborhoods.length, cols, distribution, seed: 42 }), [neighborhoods.length, cols, distribution])

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      const nextCols = 4
      const nextDistribution = width < 640 ? 'mobile' : 'desktop'
      setCols((current) => (current === nextCols ? current : nextCols))
      setDistribution((current) => (current === nextDistribution ? current : nextDistribution))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const gridColsClass = 'grid-cols-4'
  const autoRowsClass = distribution === 'mobile' ? 'auto-rows-[120px]' : 'auto-rows-[160px]'

  return (
    <div className={`grid ${gridColsClass} gap-2 sm:gap-3 md:gap-4 ${autoRowsClass} grid-flow-dense`}>
      {neighborhoods.map(({ neighborhood, propertyCount }, index) => {
        const isTop = index === 0
        const pos = layout[index]
        if (!pos) return null
        const mobileTopSpan = 'col-start-1 col-span-4 row-start-1 row-span-1'
        const isSquare = index === 1 || index === 2
        return (
          <NeighborhoodCard
            key={neighborhood.id}
            neighborhood={neighborhood}
            propertyCount={propertyCount}
            span={isTop && distribution === 'mobile' ? mobileTopSpan : `col-start-${pos.colStart} col-span-${pos.colSpan} row-start-${pos.rowStart} row-span-${pos.rowSpan}${isSquare && distribution === 'mobile' ? ' aspect-square' : ''}`}
            isTop={isTop}
          />
        )
      })}
    </div>
  )
}