import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrustService } from '../trust-service';

function createChainableMock(data: any, error: any) {
  const chain: any = {}
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'neq', 'or', 'order', 'range', 'limit', 'gte', 'in', 'ilike']
  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  chain.single = vi.fn().mockReturnValue(Promise.resolve({ data, error }))
  chain.then = (onFulfilled: any) => Promise.resolve({ data, error }).then(onFulfilled)
  return chain
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('trust-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('submitReview', () => {
    it('submits a review and awards reputation', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const reviewChain = createChainableMock({ id: 'review-1', property_id: 'p1', user_id: 'u1', overall_rating: 5 }, null)
      const reputationChain = createChainableMock([{ points: 10 }], null)
      const eventChain = createChainableMock(null, null)
      const profileChain = createChainableMock(null, null)
      
      const submitFromMock = vi.fn()
        .mockReturnValueOnce(reviewChain)
        .mockReturnValueOnce(eventChain)
      
      const awardFromMock = vi.fn()
        .mockReturnValueOnce(reputationChain)
        .mockReturnValueOnce(reputationChain)
        .mockReturnValueOnce(profileChain)
      
      ;(createClient as any).mockReturnValueOnce({
        from: submitFromMock,
      })
      
      ;(createClient as any).mockReturnValueOnce({
        from: awardFromMock,
      })

      const result = await TrustService.submitReview('u1', {
        property_id: 'p1',
        overall_rating: 5,
        content: 'Great place',
      })

      expect(result.id).toBe('review-1')
      expect(submitFromMock).toHaveBeenCalledWith('property_reviews')
      expect(awardFromMock).toHaveBeenCalledWith('reputation_events')
      expect(submitFromMock).toHaveBeenCalledWith('events')
    })

    it('throws error when submission fails', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const reviewChain = createChainableMock(null, { message: 'DB error' })
      
      ;(createClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue(reviewChain),
      })

      await expect(TrustService.submitReview('u1', {
        property_id: 'p1',
        overall_rating: 5,
      })).rejects.toThrow('Failed to submit review')
    })
  })

  describe('getPropertyReviews', () => {
    it('returns reviews for a property', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const reviewChain = createChainableMock([{ id: 'review-1', property_id: 'p1' }], null)
      
      ;(createClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue(reviewChain),
      })

      const result = await TrustService.getPropertyReviews('p1')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('review-1')
    })
  })

  describe('awardReputation', () => {
    it('updates reputation score and trust level', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const reputationChain = createChainableMock([{ points: 10 }], null)
      const profileChain = createChainableMock(null, null)
      
      const fromMock = vi.fn()
        .mockReturnValueOnce(reputationChain)
        .mockReturnValueOnce(reputationChain)
        .mockReturnValueOnce(profileChain)
      
      ;(createClient as any).mockReturnValueOnce({
        from: fromMock,
      })

      await TrustService.awardReputation('u1', 'review_created', 'Submitted a review')

      expect(fromMock).toHaveBeenCalledWith('reputation_events')
      expect(fromMock).toHaveBeenCalledWith('reputation_events')
      expect(fromMock).toHaveBeenCalledWith('profiles')
    })
  })

  describe('getScoreDimensionAverages', () => {
    it('returns null when no reviews', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const reviewChain = createChainableMock([], null)
      
      ;(createClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue(reviewChain),
      })

      const result = await TrustService.getScoreDimensionAverages('p1')

      expect(result).toBeNull()
    })

    it('computes averages from reviews', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const reviewChain = createChainableMock([
        { safety_rating: 5, hygiene_rating: 4, overall_rating: 5 },
        { safety_rating: 3, hygiene_rating: 5, overall_rating: 4 },
      ], null)
      
      ;(createClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue(reviewChain),
      })

      const result = await TrustService.getScoreDimensionAverages('p1')

      expect(result?.safety).toBe(4)
      expect(result?.hygiene).toBe(4.5)
      expect(result?.overall).toBe(4.5)
      expect(result?.review_count).toBe(2)
    })
  })
})
