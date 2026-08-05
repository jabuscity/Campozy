import { createClient } from '@/lib/supabase/server'
import type { Conversation, Message, ConversationMember } from '@/types'

export const MessagingService = {
  async getConversations(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        members:conversation_members(*, profiles!conversation_members_user_id_fkey(*))
      `)
      .order('updated_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch conversations: ${error.message}`)
    return data as Conversation[]
  },

  async getMessages(conversationId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*)
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
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data as Message
  },
}
