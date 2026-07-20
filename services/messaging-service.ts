import { createClient } from '@/lib/supabase/server'
import type { Conversation, Message } from '@/types'

export const MessagingService = {
  async getConversations(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        members:conversation_members(*, profiles(*))
      `)
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch conversations: ${error.message}`)
    return data as Conversation[]
  },

  async getMessages(conversationId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch messages: ${error.message}`)
    return data as Message[]
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, content })
      .select()
      .single()

    if (error) throw new Error(`Failed to send message: ${error.message}`)

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data as Message
  },
}
