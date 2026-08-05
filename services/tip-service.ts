import { createClient } from '@/lib/supabase/server'

export interface TipCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface TipSuggestion {
  id: string
  category_id: string
  user_id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface TipSuggestionWithCategory extends TipSuggestion {
  category?: TipCategory
  profiles?: { id: string; full_name: string | null; username: string | null; avatar_url: string | null }
}

export class TipService {
  static async getCategories(): Promise<TipCategory[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tip_categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Failed to fetch tip categories:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return []
    }

    return data as TipCategory[]
  }

  static async getApprovedTips(): Promise<TipSuggestionWithCategory[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tip_suggestions')
      .select(`
        *,
        tip_categories (*)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch approved tips:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return []
    }

    return data as unknown as TipSuggestionWithCategory[]
  }

  static async getUserPendingSuggestions(userId: string): Promise<TipSuggestionWithCategory[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tip_suggestions')
      .select(`
        *,
        tip_categories (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch user suggestions:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return []
    }

    return data as unknown as TipSuggestionWithCategory[]
  }

  static async createSuggestion(
    userId: string,
    categoryId: string,
    title: string,
    description: string
  ): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('tip_suggestions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        title,
        description,
      })

    if (error) {
      return { error: 'Failed to submit suggestion.' }
    }

    return {}
  }

  static async getPendingSuggestions(): Promise<TipSuggestionWithCategory[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tip_suggestions')
      .select(`
        *,
        tip_categories (*),
        profiles!inner (id, full_name, username, avatar_url)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch pending suggestions:', error)
      return []
    }

    return data as unknown as TipSuggestionWithCategory[]
  }

  static async approveSuggestion(suggestionId: string, userId: string): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('tip_suggestions')
      .update({
        status: 'approved',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)
      .eq('status', 'pending')

    if (error) {
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
      .from('tip_suggestions')
      .select('user_id')
      .eq('id', suggestionId)
      .eq('status', 'pending')
      .single()

    if (fetchError || !data) {
      return { error: 'Suggestion not found.' }
    }

    const { error } = await supabase
      .from('tip_suggestions')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)

    if (error) {
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
        type: 'tip_suggestion',
        title: 'Tip Suggestion Rejected',
        content: `Your tip suggestion was not approved. Reason: ${reason}`,
        link: '/tips',
      })

    if (error) {
      console.error('Failed to send rejection notification:', error)
    }
  }
}
