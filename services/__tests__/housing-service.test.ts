import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HousingService } from '../housing-service';

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

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('housing-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPropertiesByCampus', () => {
    it('returns properties for a campus with default sort by campozy_score', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const distanceChain = createChainableMock([{ neighborhood_id: 'n1' }], null)
      const propertyChain = createChainableMock([{
        id: 'p1',
        name: 'Test Property',
        property_types: { name: 'Apartment' },
        neighborhoods: { id: 'n1', name: 'Test Neighborhood', reputation_score: 80 },
      }], null)
      
      ;(createClient as any).mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(distanceChain)
          .mockReturnValueOnce(propertyChain),
      })

      const result = await HousingService.getPropertiesByCampus('campus-1')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Test Property')
      expect(propertyChain.order).toHaveBeenCalledWith('campozy_score', { ascending: false })
    })

    it('returns empty array when no distances found', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const distanceChain = createChainableMock(null, { message: 'Not found' })
      
      ;(createClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue(distanceChain),
      })

      const result = await HousingService.getPropertiesByCampus('campus-1')

      expect(result).toEqual([])
    })

    it('sorts by price when sort option is price_asc', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const distanceChain = createChainableMock([{ neighborhood_id: 'n1' }], null)
      const propertyChain = createChainableMock([], null)
      
      ;(createClient as any).mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(distanceChain)
          .mockReturnValueOnce(propertyChain),
      })

      await HousingService.getPropertiesByCampus('campus-1', { sort: 'price_asc' })

      expect(propertyChain.order).toHaveBeenCalledWith('monthly_price', { ascending: true })
    })

    it('sorts by latest when sort option is latest', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const distanceChain = createChainableMock([{ neighborhood_id: 'n1' }], null)
      const propertyChain = createChainableMock([], null)
      
      ;(createClient as any).mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(distanceChain)
          .mockReturnValueOnce(propertyChain),
      })

      await HousingService.getPropertiesByCampus('campus-1', { sort: 'latest' })

      expect(propertyChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('searchProperties', () => {
    it('searches properties by name, address, and description', async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const propertyChain = createChainableMock([{
        id: 'p1',
        name: 'Test Property',
        description: 'desc',
        neighborhoods: { name: 'n1' },
      }], null)
      
      ;(createClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue(propertyChain),
      })

      const result = await HousingService.searchProperties('test')

      expect(result).toHaveLength(1)
      expect(propertyChain.or).toHaveBeenCalled()
    })
  })
})
