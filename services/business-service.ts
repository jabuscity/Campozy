import { createClient } from '@/lib/supabase/server'
import type { Business, BusinessReview } from '@/types'

export const BusinessService = {
  async getBusinesses(options?: { neighborhoodId?: string; category?: string; limit?: number }) {
    const supabase = await createClient()
    let query = supabase
      .from('businesses')
      .select(`
        *,
        owner:profiles(*),
        media:business_media(*)
      `)
      .eq('is_active', true)
      .order('campozy_score', { ascending: false })

    if (options?.neighborhoodId) query = query.eq('neighborhood_id', options.neighborhoodId)
    if (options?.category) query = query.eq('category', options.category)
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch businesses: ${error.message}`)
    return data as Business[]
  },

  async getBusinessById(businessId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        owner:profiles(*),
        media:business_media(*),
        reviews:business_reviews(*, reviewer:profiles(*))
      `)
      .eq('id', businessId)
      .single()

    if (error) throw new Error(`Business not found: ${error.message}`)
    return data as Business
  },

  async createReview(businessId: string, reviewerId: string, review: Partial<BusinessReview>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('business_reviews')
      .insert({ business_id: businessId, reviewer_id: reviewerId, ...review })
      .select()
      .single()

    if (error) throw new Error(`Failed to create review: ${error.message}`)
    return data as BusinessReview
  },
}
