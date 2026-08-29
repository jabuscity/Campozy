'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: string
  id: string
  title: string
  description: string
  href: string
  icon: string
}

export function GlobalSearch() {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const abortRef = React.useRef<AbortController | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const prevQueryRef = React.useRef(query)

  const trimmedQuery = query.trim()
  const isEmpty = !trimmedQuery

  React.useEffect(() => {
    if (isEmpty) {
      return
    }

    if (prevQueryRef.current === trimmedQuery) {
      prevQueryRef.current = trimmedQuery
      return
    }
    prevQueryRef.current = trimmedQuery

    setLoading(true)
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        setResults(data.results || [])
        setOpen(true)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [trimmedQuery, isEmpty])

  const showDropdown = open && !isEmpty && results.length > 0
  const showEmpty = open && !isEmpty && !loading && results.length === 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="max-w-3xl mx-auto mb-6 md:mb-8 relative">
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10" style={{ color: '#1D4ED8' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => !isEmpty && results.length > 0 && setOpen(true)}
          className="w-full h-11 pl-10 pr-10 md:pr-24 rounded-full bg-white border border-neutral-200 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder="Search hostels, universities, neighborhoods, events, discussions, tips..."
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
              setOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-16 md:right-20 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 md:px-5 rounded-full font-bold text-xs md:text-sm bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20 hover:shadow-md transition-all"
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
              >
                <span className="text-lg">{result.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 truncate">{result.title}</p>
                  <p className="text-xs text-neutral-500 truncate">{result.description}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{result.type}</span>
              </Link>
            ))}
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
            onClick={() => setOpen(false)}
            className="block text-center py-3 text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-neutral-100"
          >
            View all results
          </Link>
        </div>
      )}

      {showEmpty && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-neutral-200 rounded-2xl shadow-xl p-6 text-center">
          <p className="text-sm text-neutral-500">No results found for &quot;{trimmedQuery}&quot;</p>
          <Link
            href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
            onClick={() => setOpen(false)}
            className="inline-block mt-3 text-xs font-bold text-primary hover:underline"
          >
            Search full catalog
          </Link>
        </div>
      )}
    </div>
  )
}
