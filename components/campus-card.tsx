import Link from 'next/link'

interface CampusCardProps {
  campus: {
    id: string
    name: string
    universities?: { name?: string }
  }
}

export function CampusCard({ campus }: CampusCardProps) {
  return (
    <Link href={`/campuses/${campus.id}`} className="block">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all h-full">
        <h3 className="text-lg font-black text-neutral-900 mb-2">{campus.name}</h3>
        <p className="text-sm text-neutral-500 line-clamp-2">
          {campus.universities?.name || 'Independent Campus'}
        </p>
      </div>
    </Link>
  )
}
