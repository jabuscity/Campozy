import Link from 'next/link'
import { Business } from '@/types'

export function BusinessCard({ business }: { business: Business }) {
  return (
    <Link href={`/businesses/${business.id}`} className="block">
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6 hover:shadow-lg transition-all h-full">
        <h3 className="text-lg font-black text-neutral-900 mb-2">{business.name}</h3>
        <p className="text-sm text-neutral-500 line-clamp-2">
          {business.category || 'Local Business'}
        </p>
      </div>
    </Link>
  )
}
