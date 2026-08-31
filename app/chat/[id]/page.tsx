'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Phone, Video, MoreVertical, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import type { Message, Conversation, Profile, ConversationMember } from '@/types'
import {
  getChatConversation,
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  subscribeToMessages,
  broadcastTyping,
  subscribeToTypingIndicator,
  sendMessageNotification,
} from '@/services/chat-service'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  const supabase = React.useMemo(() => createClient(), [])

  const loadConversation = useCallback(async () => {
    try {
      let { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        await new Promise(resolve => setTimeout(resolve, 800))
        const retry = await supabase.auth.getUser()
        user = retry.data.user
        if (!user) {
          router.push('/login')
          return
        }
      }
      setUserId(user.id)

      const conv = await getChatConversation(params.id)
      setConversation(conv)

      if (conv) {
        const msgs = await getChatMessages(conv.id)
        setMessages(msgs)
        await markMessagesAsRead(conv.id, user.id)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id, router, supabase])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  useEffect(() => {
    if (!params.id) return

    const channel = subscribeToMessages(
      params.id,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage])
        if (newMessage.sender_id !== userId) {
          markMessagesAsRead(params.id, userId!)
        }
      },
      (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
        )
      }
    )

    return () => {
      channel.unsubscribe()
    }
  }, [params.id, userId])

  useEffect(() => {
    if (!params.id || !userId) return

    let channel: { unsubscribe: () => void } | null = null
    const setup = async () => {
      channel = await subscribeToTypingIndicator(
        params.id,
        userId,
        (typingUserId) => {
          setTypingUsers((prev) => new Set(prev).add(typingUserId))
        },
        (typingUserId) => {
          setTypingUsers((prev) => {
            const next = new Set(prev)
            next.delete(typingUserId)
            return next
          })
        }
      )
    }

    setup()

    return () => {
      channel?.unsubscribe()
    }
  }, [params.id, userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || !userId || sending) return

    setSending(true)
    try {
      const msg = await sendChatMessage(conversation.id, userId, newMessage.trim())
      if (msg) {
        setMessages((prev) => [...prev, msg])
        setNewMessage('')

        const otherMembers = conversation.members?.filter((m) => m.user_id !== userId) || []
        const recipientIds = otherMembers.map((m) => m.user_id)
        if (recipientIds.length > 0) {
          await sendMessageNotification(conversation.id, userId, recipientIds)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }, [newMessage, conversation, userId, sending])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!params.id || !userId) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    broadcastTyping(params.id, userId, true)

    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(params.id, userId, false)
    }, 2000)
  }

  const getConversationName = (): string => {
    if (conversation?.subject) return conversation.subject
    const otherMembers = conversation?.members?.filter((m: ConversationMember) => m.user_id !== userId) || []
    if (otherMembers.length === 0) return 'Conversation'
    if (otherMembers.length === 1) {
      const member = otherMembers[0]
      return member.profiles?.full_name || member.profiles?.username || 'User'
    }
    return `${otherMembers.length + 1} members`
  }

  const getConversationAvatar = (): string | null => {
    const otherMembers = conversation?.members?.filter((m: ConversationMember) => m.user_id !== userId) || []
    if (otherMembers.length === 1) {
      return otherMembers[0].profiles?.avatar_url || null
    }
    return null
  }

  const getOtherMembers = (): Profile[] => {
    return conversation?.members
      ?.filter((m: ConversationMember) => m.user_id !== userId)
      .map((m) => m.profiles as Profile)
      .filter(Boolean) || []
  }

  const isTyping = (): boolean => {
    return typingUsers.size > 0
  }

  const getTypingText = (): string => {
    if (typingUsers.size === 0) return ''
    const typingUserIds = Array.from(typingUsers)
    const typingProfiles = conversation?.members
      ?.filter((m: ConversationMember) => typingUserIds.includes(m.user_id))
      .map((m) => m.profiles) || []

    if (typingProfiles.length === 1) {
      const profile = typingProfiles[0]
      return `${profile?.full_name || profile?.username || 'Someone'} is typing...`
    }
    return `${typingProfiles.length} people are typing...`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500">Loading conversation...</p>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500">Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/chat')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {getConversationAvatar() ? (
              <img
                src={getConversationAvatar()!}
                alt={getConversationName()}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-neutral-900 text-sm">{getConversationName()}</h2>
              {isTyping() ? (
                <p className="text-xs text-primary">{getTypingText()}</p>
              ) : (
                <p className="text-xs text-neutral-500">
                  {getOtherMembers().length > 0 && `${getOtherMembers().length} member${getOtherMembers().length > 1 ? 's' : ''}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === userId
            const sender = msg.sender as Profile | undefined

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 max-w-[80%]',
                  isOwn ? 'ml-auto flex-row-reverse' : ''
                )}
              >
                {!isOwn && (
                  <Avatar
                    src={sender?.avatar_url}
                    alt={sender?.full_name || sender?.username || 'User'}
                    fallback={sender?.full_name || sender?.username || 'U'}
                    className="h-8 w-8 shrink-0"
                  />
                )}
                <div
                  className={cn(
                    'px-4 py-2 rounded-2xl text-sm',
                    isOwn
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white border border-neutral-200 text-neutral-900 rounded-bl-sm'
                  )}
                >
                  {!isOwn && sender && (
                    <p className="text-xs font-bold text-primary mb-1">
                      {sender.full_name || sender.username}
                    </p>
                  )}
                  <p>{msg.content}</p>
                  <div className={cn(
                    'flex items-center gap-1 mt-1',
                    isOwn ? 'justify-end' : 'justify-start'
                  )}>
                    <span className={cn(
                      'text-[10px]',
                      isOwn ? 'text-white/70' : 'text-neutral-400'
                    )}>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isOwn && (
                      <span className="text-[10px] text-white/70">
                        {msg.is_read ? 'Read' : 'Sent'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-neutral-200 p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button onClick={sendMessage} size="icon" disabled={sending || !newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
