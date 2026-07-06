import { createClient } from '@/lib/supabase/server'
import type { Opportunity, OpportunityType, MentorshipProfile } from '@/types'

// ============================================================================
// OPPORTUNITY SERVICE
// Core opportunity intelligence: internships, mentorships, alumni connections.
// Implements doc 08 (Opportunity Engine).
// ============================================================================

export const OpportunityService = {
  async getOpportunities(options?: { type?: OpportunityType; isRemote?: boolean; limit?: number; offset?: number }) {
    const supabase = await createClient()
    let query = supabase
      .from('opportunities')
      .select(`
        *,
        employer:employers(name, logo_url, verification_level)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (options?.type) query = query.eq('type', options.type)
    if (options?.isRemote !== undefined) query = query.eq('is_remote', options.isRemote)
    if (options?.limit) query = query.limit(options.limit)
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch opportunities: ${error.message}`)
    return data as Opportunity[]
  },

  async getOpportunityById(opportunityId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        employer:employers(*)
      `)
      .eq('id', opportunityId)
      .single()

    if (error) throw new Error(`Opportunity not found: ${error.message}`)
    return data as Opportunity
  },

  async applyForOpportunity(opportunityId: string, studentId: string, coverNote?: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('opportunity_applications')
      .insert({
        opportunity_id: opportunityId,
        student_id: studentId,
        cover_note: coverNote
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to apply for opportunity: ${error.message}`)

    await supabase.from('events').insert({
      actor_id: studentId,
      event_type: 'opportunity_applied',
      target_id: opportunityId,
      target_type: 'opportunity',
    })

    return data
  }
}
