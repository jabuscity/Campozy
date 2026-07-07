'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

type Campus = {
  id: string
  name: string
}

export function CampusFilter({
  campuses,
  campusId,
}: {
  campuses: Campus[]
  campusId?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function changeCampus(id?: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (id) {
      params.set('campus', id)
    } else {
      params.delete('campus')
    }

    router.push(`/discovery?${params.toString()}`)
  }

  return (
    <div className="mt-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      <Badge
        variant={!campusId ? 'default' : 'outline'}
        className="py-2 px-6 rounded-xl cursor-pointer"
        onClick={() => changeCampus()}
      >
        All Campuses
      </Badge>

      {campuses.map((campus) => (
        <Badge
          key={campus.id}
          variant={campusId === campus.id ? 'default' : 'outline'}
          className="py-2 px-6 rounded-xl cursor-pointer hover:bg-neutral-50 whitespace-nowrap"
          onClick={() => changeCampus(campus.id)}
        >
          {campus.name}
        </Badge>
      ))}
    </div>
  )
}