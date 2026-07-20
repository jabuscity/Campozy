import { createClient } from '@/lib/supabase/server'
import type { AlumniProfile } from '@/types'

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
}
