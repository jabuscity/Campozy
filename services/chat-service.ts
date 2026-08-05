import { createClient } from '@/lib/supabase/client'
import type { Conversation, Message, ConversationMember, Profile } from '@/types'

// ---------------------------------------------------------------------------
// Chat Service
// ---------------------------------------------------------------------------

export async function getChatConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      members:conversation_members(*, profiles!conversation_members_user_id_fkey(*))
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch conversations:', error)
    return []
  }

  const conversations = (data || []) as Conversation[]

  if (conversations.length === 0) return conversations

  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      try {
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)

        return {
          ...conv,
          messages: messages || [],
        }
      } catch {
        return { ...conv, messages: [] }
      }
    }),
  )

  return enriched
}

export async function getChatConversation(conversationId: string): Promise<Conversation | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      members:conversation_members(*, profiles!conversation_members_user_id_fkey(*))
    `)
    .eq('id', conversationId)
    .single()

  if (error) {
    console.error('Failed to fetch conversation:', error)
    return null
  }

  return data as Conversation
}

export async function createChatConversation(
  userIds: string[],
  subject?: string
): Promise<Conversation | null> {
  const supabase = createClient()

  const uniqueUserIds = Array.from(new Set(userIds))
  if (uniqueUserIds.length < 2) return null

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      subject: subject || null,
    })
    .select()
    .single()

  if (convError || !conversation) {
    console.error('Failed to create conversation:', convError)
    return null
  }

  const memberInserts = uniqueUserIds.map((uid) => ({
    conversation_id: conversation.id,
    user_id: uid,
  }))

  const { error: memberError } = await supabase
    .from('conversation_members')
    .insert(memberInserts)

  if (memberError) {
    console.error('Failed to add members:', memberError)
    await supabase.from('conversations').delete().eq('id', conversation.id)
    return null
  }

  return conversation
}

export async function getChatMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<Message[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(*)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Failed to fetch messages:', error)
    return []
  }

  return (data || []) as Message[]
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to send message:', error)
    return null
  }

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data as Message
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const supabase = createClient()

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false)

  await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
}

export async function getUnreadCount(userId: string): Promise<Record<string, number>> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversation_members')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (error || !data || data.length === 0) return {}

  const counts: Record<string, number> = {}

  await Promise.all(
    data.map(async (member) => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', member.conversation_id)
        .neq('sender_id', userId)
        .gt('created_at', member.last_read_at || '1970-01-01')

      counts[member.conversation_id] = count || 0
    }),
  )

  return counts
}

export async function sendMessageNotification(
  conversationId: string,
  senderId: string,
  recipientIds: string[]
) {
  const supabase = createClient()

  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', senderId)
    .single()

  const senderName = senderProfile?.full_name || senderProfile?.username || 'Someone'

  const notifications = recipientIds.map((rid) => ({
    user_id: rid,
    type: 'message' as const,
    title: 'New Message',
    content: `${senderName} sent you a message`,
    link: `/chat/${conversationId}`,
    is_read: false,
  }))

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications)
  }
}

// ---------------------------------------------------------------------------
// Real-time subscriptions
// ---------------------------------------------------------------------------

export function subscribeToMessages(
  conversationId: string,
  onInsert: (message: Message) => void,
  onUpdate?: (message: Message) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onInsert(payload.new as Message)
      }
    )

  if (onUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onUpdate(payload.new as Message)
      }
    )
  }

  channel.subscribe()
  return channel
}

export async function subscribeToConversations(
  userId: string,
  onChange: (conversations: Conversation[]) => void
) {
  const supabase = createClient()

  const channelName = `conversations:${userId}`
  const existing = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`)
  if (existing) {
    await supabase.removeChannel(existing)
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      async () => {
        const conversations = await getChatConversations(userId)
        onChange(conversations)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      async () => {
        const conversations = await getChatConversations(userId)
        onChange(conversations)
      }
    )
    .subscribe()

  return channel
}

export async function subscribeToTypingIndicator(
  conversationId: string,
  userId: string,
  onTyping: (typingUserId: string) => void,
  onStopTyping: (typingUserId: string) => void
) {
  const supabase = createClient()

  const channelName = `typing:${conversationId}`
  const existing = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`)
  if (existing) {
    await supabase.removeChannel(existing)
  }

  const channel = supabase
    .channel(channelName)
    .on('broadcast', { event: 'typing' }, (payload) => {
      if (payload.payload.userId !== userId) {
        onTyping(payload.payload.userId)
      }
    })
    .on('broadcast', { event: 'stop_typing' }, (payload) => {
      if (payload.payload.userId !== userId) {
        onStopTyping(payload.payload.userId)
      }
    })
    .subscribe()

  return channel
}

export async function broadcastTyping(
  conversationId: string,
  userId: string,
  isTyping: boolean
) {
  const supabase = createClient()

  const channelName = `typing:${conversationId}`
  const existing = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`)
  if (existing) {
    await supabase.removeChannel(existing)
  }

  const channel = supabase.channel(channelName)
  await channel.subscribe()

  if (isTyping) {
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId },
    })
  } else {
    await channel.send({
      type: 'broadcast',
      event: 'stop_typing',
      payload: { userId },
    })
  }
}
