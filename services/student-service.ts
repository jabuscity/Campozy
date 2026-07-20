import { createClient } from '@/lib/supabase/server'
import type { Student, StudentPreferences } from '@/types'

export const StudentService = {
  async getStudent(studentId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profiles(*),
        campus:campuses(*, universities(*)),
        preferences:student_preferences(*),
        lifecycle:student_lifecycle_history(*)
      `)
      .eq('id', studentId)
      .single()

    if (error) throw new Error(`Student not found: ${error.message}`)
    return data as Student
  },

  async getPreferences(studentId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('student_preferences')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (error) return null
    return data as StudentPreferences
  },

  async updatePreferences(studentId: string, updates: Partial<StudentPreferences>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('student_preferences')
      .upsert({ student_id: studentId, ...updates })
      .select()
      .single()

    if (error) throw new Error(`Failed to update preferences: ${error.message}`)
    return data as StudentPreferences
  },

  async getSavedSearches(studentId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('student_saved_searches')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch saved searches: ${error.message}`)
    return data
  },
}
