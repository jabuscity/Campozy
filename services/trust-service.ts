import { createClient } from '@/lib/supabase/server'
import type {
  PropertyReview,
  CampozyScoreDimensions,
  ReputationEvent,
  VerificationRecord,
  VerificationLevel,
  TrustLevel,
} from '@/types'

// ============================================================================
// TRUST SERVICE
// Core trust intelligence: reviews, Campozy Score, reputation, verification.
// Implements docs 05 (Reputation), 06 (Verification), and the Campozy Score.
// ============================================================================

// Reputation point values for different contribution types
const REPUTATION_POINTS = {
  review_created: 10,
  review_helpful_vote: 2,
  review_flagged_spam: -15,
  utility_report: 8,
  hygiene_report: 8,
  discussion_created: 5,
  discussion_reply: 3,
  reply_helpful: 2,
  verification_accurate: 15,
  verification_inaccurate: -20,
  referral_qualified: 10,
  warning_confirmed: 12,
  tip_helpful: 5,
  knowledge_article: 15,
  spam_content: -25,
  harassment: -50,
} as const

// Trust level thresholds
const TRUST_THRESHOLDS: { level: TrustLevel; minScore: number }[] = [
  { level: 'campozy_fellow', minScore: 1000 },
  { level: 'community_leader', minScore: 500 },
  { level: 'campus_expert', minScore: 250 },
  { level: 'trusted_contributor', minScore: 100 },
  { level: 'contributor', minScore: 25 },
  { level: 'member', minScore: 1 },
  { level: 'new', minScore: 0 },
]

export const TrustService = {
  // ── Reviews ──────────────────────────────────────────────────────────────

  async submitReview(userId: string, reviewData: {
    property_id: string;
    overall_rating: number;
    content?: string;
    stay_duration_months?: number;
  } & Partial<CampozyScoreDimensions>) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('property_reviews')
      .insert({ ...reviewData, user_id: userId })
      .select()
      .single()

    if (error) throw new Error(`Failed to submit review: ${error.message}`)

    // Award reputation points
    await this.awardReputation(userId, 'review_created', 'Submitted a property review')

    // Log event
    await supabase.from('events').insert({
      actor_id: userId,
      event_type: 'review_created',
      target_id: reviewData.property_id,
      target_type: 'property',
      payload: { review_id: data.id, rating: reviewData.overall_rating },
    })

    return data as PropertyReview
  },

  async getPropertyReviews(propertyId: string, options?: { limit?: number; offset?: number }) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('property_reviews')
      .select(`
        *,
        profiles!property_reviews_user_id_fkey(id, username, full_name, avatar_url, trust_level, is_verified),
        property_review_media(*)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(options?.limit || 20)

    if (error) throw new Error(`Failed to fetch reviews: ${error.message}`)
    return data as PropertyReview[]
  },

  async voteReview(userId: string, reviewId: string, isHelpful: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('property_review_votes')
      .upsert({ review_id: reviewId, user_id: userId, is_helpful: isHelpful })

    if (error) throw new Error(`Failed to vote: ${error.message}`)

    // Update helpful count on the review
    if (isHelpful) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('property_reviews')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update({ helpful_count: (supabase as any).raw('helpful_count + 1') })
          .eq('id', reviewId)
      } catch {
        // Ignore increment failure
      }
    }

    // Get review author and award reputation
    const { data: review } = await supabase
      .from('property_reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single()

    if (review && isHelpful) {
      await this.awardReputation(review.user_id, 'review_helpful_vote', 'Review marked as helpful')
    }
  },

  async flagReview(userId: string, reviewId: string, reason: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('property_review_flags')
      .insert({ review_id: reviewId, flagged_by: userId, reason })

    if (error) throw new Error(`Failed to flag review: ${error.message}`)
  },

  // ── Campozy Score ────────────────────────────────────────────────────────
  // Note: The primary score calculation is done by a PostgreSQL trigger
  // (recalculate_campozy_score). This method is for manual recalculation.

  async getCampozyScore(propertyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select('campozy_score, verification_level')
      .eq('id', propertyId)
      .single()

    if (error) throw new Error(`Property not found: ${error.message}`)
    return data
  },

  async getScoreDimensionAverages(propertyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('property_reviews')
      .select(`
        safety_rating,
        hygiene_rating,
        water_rating,
        electricity_rating,
        internet_rating,
        management_rating,
        accessibility_rating,
        value_for_money_rating,
        overall_rating
      `)
      .eq('property_id', propertyId)

    if (error) throw new Error(`Failed to fetch dimensions: ${error.message}`)

    const reviews = data || []
    if (reviews.length === 0) return null

    const avg = (key: keyof typeof reviews[number]) => {
      const vals = reviews
        .map(r => r[key])
        .filter((value): value is number => typeof value === 'number')

      return vals.length > 0
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : null
    }

    return {
      review_count: reviews.length,
      safety: avg('safety_rating'),
      hygiene: avg('hygiene_rating'),
      water: avg('water_rating'),
      electricity: avg('electricity_rating'),
      internet: avg('internet_rating'),
      management: avg('management_rating'),
      accessibility: avg('accessibility_rating'),
      value_for_money: avg('value_for_money_rating'),
      overall: avg('overall_rating'),
    }
  },

  // ── Reputation ───────────────────────────────────────────────────────────

  async awardReputation(
    userId: string,
    eventType: keyof typeof REPUTATION_POINTS,
    reason?: string
  ) {
    const supabase = await createClient()
    const points = REPUTATION_POINTS[eventType]

    // Insert reputation event
    await supabase.from('reputation_events').insert({
      user_id: userId,
      event_type: eventType,
      points,
      reason,
    })

    // Update aggregate scores on profile
    const { data: events } = await supabase
      .from('reputation_events')
      .select('points')
      .eq('user_id', userId)

    if (events) {
      const totalReputation = events.reduce((sum, e) => sum + e.points, 0)
      const positiveContributions = events.filter(e => e.points > 0).reduce((sum, e) => sum + e.points, 0)

      // Determine trust level
      const trustLevel = TRUST_THRESHOLDS.find(t => totalReputation >= t.minScore)?.level || 'new'

      await supabase
        .from('profiles')
        .update({
          reputation_score: Math.max(0, totalReputation),
          contribution_score: positiveContributions,
          trust_level: trustLevel,
        })
        .eq('id', userId)
    }
  },

  async getReputationHistory(userId: string, limit = 50) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reputation_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch reputation history: ${error.message}`)
    return data as ReputationEvent[]
  },

  // ── Verification ─────────────────────────────────────────────────────────

  async requestVerification(entityId: string, entityType: string, userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('verification_records')
      .insert({
        entity_id: entityId,
        entity_type: entityType,
        verification_level: 'claimed',
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to request verification: ${error.message}`)

    await supabase.from('events').insert({
      actor_id: userId,
      event_type: 'verification_requested',
      target_id: entityId,
      target_type: entityType,
    })

    return data as VerificationRecord
  },

  async submitVerificationEvidence(verificationId: string, userId: string, evidence: {
    evidence_type: string;
    url: string;
    description?: string;
  }) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('verification_evidence')
      .insert({ ...evidence, verification_id: verificationId, uploaded_by: userId })
      .select()
      .single()

    if (error) throw new Error(`Failed to submit evidence: ${error.message}`)
    return data
  },

  async processVerification(
    verificationId: string,
    verifierId: string,
    decision: 'approved' | 'rejected',
    level: VerificationLevel,
    notes?: string
  ) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('verification_records')
      .update({
        status: decision,
        verifier_id: verifierId,
        verification_level: decision === 'approved' ? level : 'unverified',
        verified_at: decision === 'approved' ? new Date().toISOString() : null,
        notes,
      })
      .eq('id', verificationId)
      .select()
      .single()

    if (error) throw new Error(`Failed to process verification: ${error.message}`)

    // If it's a property verification, update the property's verification level
    const record = data as VerificationRecord
    if (record.entity_type === 'property' && decision === 'approved') {
      await supabase
        .from('properties')
        .update({ verification_level: level })
        .eq('id', record.entity_id)
    }

    return record
  },

  async getVerificationQueue(entityType?: string) {
    const supabase = await createClient()
    let query = supabase
      .from('verification_records')
      .select('*, verification_evidence(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (entityType) query = query.eq('entity_type', entityType)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch verification queue: ${error.message}`)
    return data as VerificationRecord[]
  },
}
