import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server'

const mockChain = () => {
  const chain: any = {}
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'neq', 'or', 'order', 'range', 'limit', 'gte', 'in', 'ilike']
  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  chain.single = vi.fn()
  return chain
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty results for empty query', async () => {
    const { GET } = await import('@/app/api/search/route')
    const response = await GET(new Request('http://localhost:3000/api/search?q='))
    const data = await response.json()
    expect(data.results).toEqual([])
  })

  it('searches properties, universities, campuses, and neighborhoods', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const chain = mockChain()
    ;(createClient as any).mockReturnValue({
      from: vi.fn(() => chain),
    })

    chain.limit.mockResolvedValueOnce({
      data: [{ id: 'p1', name: 'Test Property', description: 'desc' }],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const { GET } = await import('@/app/api/search/route')
    const response = await GET(new Request('http://localhost:3000/api/search?q=test'))
    const data = await response.json()

    expect(data.results).toHaveLength(1)
    expect(data.results[0].type).toBe('property')
    expect(data.results[0].title).toBe('Test Property')
  })

  it('escapes special characters in search query', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const chain = mockChain()
    ;(createClient as any).mockReturnValue({
      from: vi.fn(() => chain),
    })

    chain.limit.mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockResolvedValueOnce({
      data: [],
      error: null,
    })

    const { GET } = await import('@/app/api/search/route')
    const response = await GET(new Request('http://localhost:3000/api/search?q=100%_test'))
    const data = await response.json()

    expect(data.query).toBe('100%_test')
  })
})
