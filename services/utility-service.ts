import { createClient } from '@/lib/supabase/server'
import type { UtilityReport, UtilityIncident } from '@/types'

export const UtilityService = {
  async getRecentReports(options?: { campusId?: string; neighborhoodId?: string; limit?: number }) {
    const supabase = await createClient()
    let query = supabase
      .from('utility_reports')
      .select(`
        *,
        property:properties(id, name, neighborhood:neighborhoods(id, name)),
        utility_type:utility_types(id, name)
      `)
      .order('created_at', { ascending: false })

    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error) return []
    return (data || []) as Array<UtilityReport & { property?: { id: string; name: string; neighborhood?: { id: string; name: string } }; utility_type?: { id: string; name: string } }>
  },

  async getRecentIncidents(options?: { campusId?: string; limit?: number }) {
    const supabase = await createClient()
    let query = supabase
      .from('utility_incidents')
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error) return []
    return (data || []) as UtilityIncident[]
  },
}
