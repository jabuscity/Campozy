import { createClient } from '@/lib/supabase/server'
import type { ParentProfile, ParentStudentLink, ParentAlert } from '@/types'

export const ParentService = {
  async getProfile(parentId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('parent_profiles')
      .select(`
        *,
        profile:profiles(*),
        links:parent_student_links(*, student:profiles(*))
      `)
      .eq('id', parentId)
      .single()

    if (error) throw new Error(`Parent profile not found: ${error.message}`)
    return data as ParentProfile
  },

  async linkStudent(parentId: string, studentId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('parent_student_links')
      .insert({ parent_id: parentId, student_id: studentId, status: 'pending' })
      .select()
      .single()

    if (error) throw new Error(`Failed to link student: ${error.message}`)
    return data as ParentStudentLink
  },

  async getAlerts(parentId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('parent_alerts')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch alerts: ${error.message}`)
    return data as ParentAlert[]
  },
}
