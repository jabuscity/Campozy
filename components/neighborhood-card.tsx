import Link from 'next/link'

interface NeighborhoodCardProps {
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
  propertyCount?: number
  span?: string
  isTop?: boolean
}

const getLabel = (score: number | null | undefined): { label: string; color: string } | null => {
  if (score == null) return null
  if (score >= 85) return { label: 'Top neighborhood', color: 'bg-emerald-500 text-white' }
  if (score >= 70) return { label: 'Good', color: 'bg-blue-500 text-white' }
  if (score >= 50) return { label: 'Average', color: 'bg-amber-500 text-white' }
  return { label: 'Worrisome', color: 'bg-red-500 text-white' }
}

export function NeighborhoodCard({ neighborhood, propertyCount, span, isTop }: NeighborhoodCardProps) {
  const label = getLabel(neighborhood.reputation_score)
  const image = neighborhood.image_url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop'

  return (
    <Link href={`/neighborhoods/${neighborhood.id}`} className={`block ${span || ''}`}>
      <div className={`relative w-full h-full rounded-2xl overflow-hidden group ${
        isTop ? 'border-2 border-primary shadow-lg shadow-primary/10' : ''
      }`}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative flex flex-col justify-between items-start h-full p-3 sm:p-4 md:p-5">
          <div className="flex items-center justify-between gap-2 w-full">
            {label && (
              <span className={`inline-flex items-center truncate rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-black ${label.color}`}>
                {label.label}
              </span>
            )}
            {typeof propertyCount === 'number' && (
              <span className={`inline-flex items-center justify-center rounded-full border-2 border-white font-black flex-shrink-0 ${
                isTop
                  ? 'h-8 w-8 sm:h-9 sm:w-9 text-xs text-white'
                  : 'h-6 w-6 sm:h-7 sm:w-7 text-[10px] sm:text-xs text-white'
              }`}>
                {propertyCount}
              </span>
            )}
          </div>
          <div className="mt-auto w-full">
            <h3 className={`font-black text-white leading-tight mb-0.5 sm:mb-1 line-clamp-1 ${
              isTop ? 'text-lg sm:text-xl md:text-2xl' : 'text-sm sm:text-base md:text-lg'
            }`}>
              {neighborhood.name}
            </h3>
            <p className={`text-white/80 line-clamp-1 sm:line-clamp-2 ${
              isTop ? 'text-xs sm:text-sm md:text-base' : 'text-[10px] sm:text-xs md:text-sm'
            }`}>
              {neighborhood.description || `${neighborhood.cities?.name || ''} ${neighborhood.cities?.countries?.name || ''}`}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
