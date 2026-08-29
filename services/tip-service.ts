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
  upvotes: number
  downvotes: number
  custom_category_name: string | null
}

export interface TipVote {
  id: string
  tip_id: string
  user_id: string
  vote_type: number
  created_at: string
}

export interface TipSuggestionWithCategory extends TipSuggestion {
  category?: TipCategory
  profiles?: { id: string; full_name: string | null; username: string | null; avatar_url: string | null }
  user_vote?: number | null
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

  static async getUserContributions(userId: string): Promise<TipSuggestionWithCategory[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tip_suggestions')
      .select(`
        *,
        tip_categories (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch user contributions:', {
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
    description: string,
    customCategoryName?: string
  ): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('tip_suggestions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        title,
        description,
        custom_category_name: customCategoryName || null,
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

  static async getUserVote(tipId: string, userId: string): Promise<TipVote | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tip_votes')
      .select('*')
      .eq('tip_id', tipId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data as TipVote
  }

  static async vote(tipId: string, userId: string, voteType: 1 | -1): Promise<{ error?: string }> {
    const supabase = await createClient()

    const { data: existing, error: fetchError } = await supabase
      .from('tip_votes')
      .select('vote_type')
      .eq('tip_id', tipId)
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Failed to check existing vote:', {
        message: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint,
      })
      return { error: 'Failed to process vote.' }
    }

    if (existing) {
      if (existing.vote_type === voteType) {
        const { error: delError } = await supabase
          .from('tip_votes')
          .delete()
          .eq('tip_id', tipId)
          .eq('user_id', userId)

        if (delError) {
          console.error('Failed to remove vote:', {
            message: delError.message,
            code: delError.code,
            details: delError.details,
            hint: delError.hint,
          })
          return { error: 'Failed to process vote.' }
        }
      } else {
        const { error: updError } = await supabase
          .from('tip_votes')
          .update({ vote_type: voteType })
          .eq('tip_id', tipId)
          .eq('user_id', userId)

        if (updError) {
          console.error('Failed to update vote:', {
            message: updError.message,
            code: updError.code,
            details: updError.details,
            hint: updError.hint,
          })
          return { error: 'Failed to process vote.' }
        }
      }
    } else {
      const { error: insError } = await supabase
        .from('tip_votes')
        .insert({ tip_id: tipId, user_id: userId, vote_type: voteType })

      if (insError) {
        console.error('Failed to insert vote:', {
          message: insError.message,
          code: insError.code,
          details: insError.details,
          hint: insError.hint,
        })
        return { error: 'Failed to process vote.' }
      }
    }

    return {}
  }

  static async createCategory(name: string, description?: string): Promise<TipCategory | null> {
    const supabase = await createClient()
    const icon = this.pickIconForCategory(name)
    const { data, error } = await supabase
      .from('tip_categories')
      .insert({
        name,
        description: description || null,
        icon,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Failed to create category:', error)
      return null
    }

    return data as TipCategory
  }

  private static readonly CATEGORY_ICONS = [
    'bookmark', 'star', 'heart', 'flag', 'book-open',
    'lightbulb', 'rocket', 'shield', 'tool', 'globe',
    'puzzle', 'zap', 'compass', 'anchor', 'cpu',
  ]

  private static pickIconForCategory(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i)
      hash |= 0
    }
    const index = Math.abs(hash) % this.CATEGORY_ICONS.length
    return this.CATEGORY_ICONS[index]
  }

  static async approveSuggestion(
    suggestionId: string,
    userId: string,
    categoryId?: string,
    customCategoryName?: string
  ): Promise<{ error?: string; category?: TipCategory }> {
    const supabase = await createClient()

    let finalCategoryId = categoryId

    if (customCategoryName && customCategoryName.trim()) {
      const category = await this.createCategory(customCategoryName.trim())
      if (!category) {
        return { error: 'Failed to create new category.' }
      }
      finalCategoryId = category.id
    }

    const { error } = await supabase
      .from('tip_suggestions')
      .update({
        status: 'approved',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        ...(finalCategoryId ? { category_id: finalCategoryId } : {}),
        custom_category_name: null,
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
