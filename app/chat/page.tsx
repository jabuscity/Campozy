'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, MessageCircle, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import {
  getChatConversations,
  createChatConversation,
  getUnreadCount,
  subscribeToConversations,
  sendMessageNotification,
} from '@/services/chat-service'
import type { Conversation, Message, ConversationMember } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  const loadConversations = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)
      const [convs, unread] = await Promise.all([
        getChatConversations(user.id),
        getUnreadCount(user.id),
      ])
      setConversations(convs)
      setUnreadCounts(unread)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadConversations()

    let subscription: { unsubscribe: () => void } | null = null
    const setupSubscription = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        subscription = await subscribeToConversations(user.id, async (updatedConversations) => {
          setConversations(updatedConversations)
          const unread = await getUnreadCount(user.id)
          setUnreadCounts(unread)
        })
      }
    }

    setupSubscription()

    return () => {
      subscription?.unsubscribe()
    }
  }, [loadConversations])

  const getConversationName = (conversation: Conversation): string => {
    if (conversation.subject) return conversation.subject
    const otherMembers = conversation.members?.filter((m: ConversationMember) => m.user_id !== userId) || []
    if (otherMembers.length === 0) return 'Conversation'
    if (otherMembers.length === 1) {
      const member = otherMembers[0]
      return member.profiles?.full_name || member.profiles?.username || 'User'
    }
    return `${otherMembers.length + 1} members`
  }

  const getConversationAvatar = (conversation: Conversation): string | null => {
    const otherMembers = conversation.members?.filter((m: ConversationMember) => m.user_id !== userId) || []
    if (otherMembers.length === 1) {
      return otherMembers[0].profiles?.avatar_url || null
    }
    return null
  }

  const getLastMessage = (conversation: Conversation): Message | undefined => {
    return conversation.messages?.[0]
  }

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv)
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500">Loading conversations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Chat</h1>
          </div>
          <Button onClick={() => setIsNewChatOpen(true)} size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
              <MessageCircle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No conversations yet</p>
              <Button className="mt-4" onClick={() => setIsNewChatOpen(true)}>
                Start a new chat
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const name = getConversationName(conversation)
              const avatar = getConversationAvatar(conversation)
              const lastMessage = getLastMessage(conversation)
              const unreadCount = unreadCounts[conversation.id] || 0

              return (
                <Link
                  key={conversation.id}
                  href={`/chat/${conversation.id}`}
                  className="block bg-white rounded-2xl border border-neutral-200 p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-neutral-900 truncate">{name}</h3>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-sm text-neutral-500 truncate">
                          {lastMessage.sender_id === userId ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                    {lastMessage && (
                      <div className="text-xs text-neutral-400 flex-shrink-0">
                        {new Date(lastMessage.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onChatCreated={(conversationId) => {
          setIsNewChatOpen(false)
          router.push(`/chat/${conversationId}`)
        }}
      />
    </div>
  )
}

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onChatCreated: (conversationId: string) => void
}

function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<{ id: string; full_name: string | null; username: string | null; avatar_url: string | null }[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!isOpen) return

    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([])
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .limit(10)

      if (!error && data) {
        setUsers(data)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [isOpen, searchQuery, supabase])

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const allUserIds = [user.id, ...selectedUsers]
      const conversation = await createChatConversation(allUserIds, subject || undefined)

      if (conversation) {
        await sendMessageNotification(conversation.id, user.id, selectedUsers)
        onChatCreated(conversation.id)
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Chat">
      <div className="space-y-4">
        <Input
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />

        {users.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors',
                  selectedUsers.includes(user.id)
                    ? 'bg-primary/10 border border-primary'
                    : 'bg-neutral-50 hover:bg-neutral-100 border border-transparent'
                )}
                onClick={() => {
                  setSelectedUsers((prev) =>
                    prev.includes(user.id)
                      ? prev.filter((id) => id !== user.id)
                      : [...prev, user.id]
                  )
                }}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.username || ''}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center">
                    <span className="text-sm font-bold text-neutral-500">
                      {(user.full_name || user.username || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm text-neutral-900">
                    {user.full_name || user.username}
                  </p>
                  {user.username && user.full_name && (
                    <p className="text-xs text-neutral-500">@{user.username}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Input
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateChat} disabled={selectedUsers.length === 0 || loading}>
            {loading ? 'Creating...' : 'Create Chat'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
