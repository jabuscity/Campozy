"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function DiscoverySearch({ query }: { query: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString())
      params.set("q", e.currentTarget.value)

      router.push(`/discovery?${params.toString()}`)
    }
  }

  return (
    <div className="relative flex-1 md:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />

      <input
        type="text"
        placeholder="Search neighborhood or hostel..."
        className="w-full pl-10 pr-4 h-11 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        defaultValue={query}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}