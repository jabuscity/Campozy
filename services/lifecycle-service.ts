import { createClient } from '@/lib/supabase/server'
import type { AlumniProfile, TransitionProfile, HousingTransitionPreference, AkwetRecommendationProfile, TransitionEvent, TransitionRecommendation } from '@/types'

export const LifecycleService = {
  async transitionRole(userId: string, newRole: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('student_lifecycle_history')
      .insert({ student_id: userId, status: newRole })

    if (error) throw new Error(`Failed to transition role: ${error.message}`)
  },

  async getAlumniProfile(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('alumni_profiles')
      .select(`
        *,
        profile:profiles(*),
        university:universities(*)
      `)
      .eq('id', userId)
      .single()

    if (error) return null
    return data as AlumniProfile
  },

  async createAlumniProfile(userId: string, universityId: string, data: Partial<AlumniProfile>) {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('alumni_profiles')
      .insert({ id: userId, university_id: universityId, ...data })
      .select()
      .single()

    if (error) throw new Error(`Failed to create alumni profile: ${error.message}`)
    return profile as AlumniProfile
  },

  async getTransitionProfile(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('transition_profiles')
      .select(`
        *,
        target_city:cities(id, name, countries(name))
      `)
      .eq('id', userId)
      .single()

    if (error) return null
    return data as TransitionProfile
  },

  async createTransitionProfile(userId: string, data: Partial<TransitionProfile>) {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('transition_profiles')
      .insert({ id: userId, ...data })
      .select()
      .single()

    if (error) throw new Error(`Failed to create transition profile: ${error.message}`)
    return profile as TransitionProfile
  },

  async getTransitionPreferences(transitionProfileId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('housing_transition_preferences')
      .select('*')
      .eq('transition_profile_id', transitionProfileId)
      .single()

    if (error) return null
    return data as HousingTransitionPreference
  },

  async getAkwetRecommendations(transitionProfileId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('akwet_recommendation_profiles')
      .select('*')
      .eq('transition_profile_id', transitionProfileId)
      .order('created_at', { ascending: false })

    if (error) return []
    return data as AkwetRecommendationProfile[]
  },

  async getTransitionEvents(transitionProfileId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('transition_events')
      .select('*')
      .eq('transition_profile_id', transitionProfileId)
      .order('created_at', { ascending: false })

    if (error) return []
    return data as TransitionEvent[]
  },

  async getTransitionRecommendations(transitionProfileId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('transition_recommendations')
      .select('*')
      .eq('transition_profile_id', transitionProfileId)
      .order('score', { ascending: false })

    if (error) return []
    return data as TransitionRecommendation[]
  },
}
