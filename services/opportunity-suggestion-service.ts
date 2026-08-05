import { createClient } from '@/lib/supabase/server'
import { NotificationType } from '@/types'

export interface OpportunitySuggestion {
  id: string
  user_id: string
  type: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface OpportunitySuggestionWithProfile extends OpportunitySuggestion {
  profile?: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
  }
}

export class OpportunitySuggestionService {
  static async createSuggestion(
    userId: string,
    type: string,
    title: string,
    description: string
  ): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('opportunity_suggestions')
      .insert({
        user_id: userId,
        type,
        title,
        description,
      })

    if (error) {
      console.error('Failed to create opportunity suggestion:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { error: 'Failed to submit opportunity suggestion.' }
    }

    return {}
  }

  static async getApprovedSuggestions(): Promise<OpportunitySuggestion[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('opportunity_suggestions')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch approved opportunity suggestions:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return []
    }

    return data as OpportunitySuggestion[]
  }

  static async getUserPendingSuggestions(userId: string): Promise<OpportunitySuggestion[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('opportunity_suggestions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch user opportunity suggestions:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return []
    }

    return data as OpportunitySuggestion[]
  }

  static async getPendingSuggestions(): Promise<OpportunitySuggestionWithProfile[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('opportunity_suggestions')
      .select(`
        *,
        profiles!inner (id, full_name, username, avatar_url)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch pending opportunity suggestions:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return []
    }

    return data as unknown as OpportunitySuggestionWithProfile[]
  }

  static async approveSuggestion(suggestionId: string, userId: string): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('opportunity_suggestions')
      .update({
        status: 'approved',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)
      .eq('status', 'pending')

    if (error) {
      console.error('Failed to approve opportunity suggestion:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { error: 'Failed to approve suggestion.' }
    }

    return {}
  }

  static async rejectSuggestion(
    suggestionId: string,
    userId: string,
    rejectionReason: string
  ): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { data, error: fetchError } = await supabase
      .from('opportunity_suggestions')
      .select('user_id')
      .eq('id', suggestionId)
      .eq('status', 'pending')
      .single()

    if (fetchError || !data) {
      return { error: 'Suggestion not found.' }
    }

    const { error } = await supabase
      .from('opportunity_suggestions')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)

    if (error) {
      console.error('Failed to reject opportunity suggestion:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { error: 'Failed to reject suggestion.' }
    }

    await this.sendRejectionNotification(data.user_id, rejectionReason)

    return {}
  }

  private static async sendRejectionNotification(userId: string, reason: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'opportunity_suggestion' as NotificationType,
        title: 'Opportunity Suggestion Rejected',
        content: `Your opportunity suggestion was not approved. Reason: ${reason}`,
        link: '/opportunities',
      })

    if (error) {
      console.error('Failed to send rejection notification:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
    }
  }
}
