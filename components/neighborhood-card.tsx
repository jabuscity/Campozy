import Link from 'next/link'

interface NeighborhoodCardProps {
  neighborhood: {
    id: string
    name: string
    cities?: {
      name?: string
      countries?: { name?: string }
    }
  }
}

export function NeighborhoodCard({ neighborhood }: NeighborhoodCardProps) {
  return (
    <Link href={`/neighborhoods/${neighborhood.id}`} className="block">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all h-full">
        <h3 className="text-lg font-black text-neutral-900 mb-2">{neighborhood.name}</h3>
        <p className="text-sm text-neutral-500 line-clamp-2">
          {neighborhood.cities?.name || ''} {neighborhood.cities?.countries?.name || ''}
        </p>
      </div>
    </Link>
  )
}
