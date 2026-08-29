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

describe('api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success for valid credentials', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const chain = mockChain()
    ;(createClient as any).mockReturnValue({
      from: vi.fn(() => chain),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
          error: null,
        }),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
          error: null,
        }),
      },
    })

    const { POST } = await import('@/app/api/auth/login/route')
    const response = await POST(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('returns 401 for invalid credentials', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const chain = mockChain()
    ;(createClient as any).mockReturnValue({
      from: vi.fn(() => chain),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid credentials' },
        }),
      },
    })

    const { POST } = await import('@/app/api/auth/login/route')
    const response = await POST(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
      })
    )
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid email or password.')
  })
})
