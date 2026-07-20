import Link from 'next/link'

interface UniversityCardProps {
  university: {
    id: string
    name: string
    countries?: { name?: string }
  }
}

export function UniversityCard({ university }: UniversityCardProps) {
  return (
    <Link href={`/universities/${university.id}`} className="block">
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6 hover:shadow-lg transition-all h-full">
        <h3 className="text-lg font-black text-neutral-900 mb-2">{university.name}</h3>
        <p className="text-sm text-neutral-500 line-clamp-2">
          {university.countries?.name || 'Kenya'}
        </p>
      </div>
    </Link>
  )
}
