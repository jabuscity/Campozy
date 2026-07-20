import { createClient } from '@/lib/supabase/server'
import type { RecommendationCandidate } from '@/types'

export const RecommendationService = {
  async getRecommendations(userId: string, limit = 20) {
    const supabase = await createClient()

    await supabase
      .from('recommendation_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    const { data: savedProperties } = await supabase
      .from('saved_properties')
      .select('property_id')
      .eq('user_id', userId)
      .limit(10)

    const { data: savedBusinesses } = await supabase
      .from('saved_businesses')
      .select('business_id')
      .eq('user_id', userId)
      .limit(10)

    const { data: savedOpportunities } = await supabase
      .from('saved_opportunities')
      .select('opportunity_id')
      .eq('user_id', userId)
      .limit(10)

    const { data: feedback } = await supabase
      .from('recommendation_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    const savedPropertyIds = new Set((savedProperties || []).map(s => s.property_id))
    const savedBusinessIds = new Set((savedBusinesses || []).map(s => s.business_id))
    const savedOpportunityIds = new Set((savedOpportunities || []).map(s => s.opportunity_id))

    const dismissedEntityIds = new Set(
      (feedback || [])
        .filter(f => f.action === 'dismissed')
        .map(f => f.entity_id)
    )

    const candidates: RecommendationCandidate[] = []

    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .order('reputation_score', { ascending: false })
      .limit(limit)

    for (const p of properties || []) {
      if (dismissedEntityIds.has(p.id)) continue
      const score = savedPropertyIds.has(p.id) ? 95 : Math.min(100, (p.reputation_score || p.campozy_score || 50) + 10)
      candidates.push({
        id: `${userId}-property-${p.id}`,
        user_id: userId,
        entity_type: 'property',
        entity_id: p.id,
        score,
        reason: savedPropertyIds.has(p.id) ? 'Based on your saved properties' : 'Highly rated by students',
        source: 'rules',
        created_at: new Date().toISOString(),
      })
    }

    const { data: neighborhoods } = await supabase
      .from('neighborhoods')
      .select('*')
      .order('reputation_score', { ascending: false })
      .limit(limit)

    for (const n of neighborhoods || []) {
      if (dismissedEntityIds.has(n.id)) continue
      const score = Math.min(100, (n.reputation_score || 50) + 5)
      candidates.push({
        id: `${userId}-neighborhood-${n.id}`,
        user_id: userId,
        entity_type: 'neighborhood',
        entity_id: n.id,
        score,
        reason: 'Popular student neighborhood',
        source: 'preferences',
        created_at: new Date().toISOString(),
      })
    }

    const { data: businesses } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .order('campozy_score', { ascending: false })
      .limit(limit)

    for (const b of businesses || []) {
      if (dismissedEntityIds.has(b.id)) continue
      const score = savedBusinessIds.has(b.id) ? 95 : Math.min(100, b.campozy_score + 5)
      candidates.push({
        id: `${userId}-business-${b.id}`,
        user_id: userId,
        entity_type: 'business',
        entity_id: b.id,
        score,
        reason: savedBusinessIds.has(b.id) ? 'Matches your interests' : 'Top-rated local business',
        source: 'behavior',
        created_at: new Date().toISOString(),
      })
    }

    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    for (const o of opportunities || []) {
      if (dismissedEntityIds.has(o.id)) continue
      const score = savedOpportunityIds.has(o.id) ? 95 : 70 + Math.floor(Math.random() * 20)
      candidates.push({
        id: `${userId}-opportunity-${o.id}`,
        user_id: userId,
        entity_type: 'opportunity',
        entity_id: o.id,
        score,
        reason: savedOpportunityIds.has(o.id) ? 'Saved opportunity' : 'New opportunity for you',
        source: 'rules',
        created_at: new Date().toISOString(),
      })
    }

    candidates.sort((a, b) => b.score - a.score)

    return candidates.slice(0, limit)
  },

  async recordFeedback(userId: string, entityId: string, entityType: string, action: 'viewed' | 'saved' | 'dismissed' | 'clicked' | 'applied') {
    const supabase = await createClient()
    const { error } = await supabase
      .from('recommendation_feedback')
      .insert({ user_id: userId, entity_id: entityId, entity_type: entityType, action })

    if (error) throw new Error(`Failed to record feedback: ${error.message}`)
  },
}
