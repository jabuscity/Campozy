'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, MessageCircle, Users, ArrowLeft, UserPlus, UserCheck, Home, CheckCircle2, UserX, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MatchBadge } from '@/components/matching/match-badge'
import {
  getChatConversations,
  createChatConversation,
  getUnreadCount,
  subscribeToConversations,
  sendMessageNotification,
} from '@/services/chat-service'
import {
  getCompatibilityResult,
  type CompatibilityType,
} from '@/services/compatibility-service'
import {
  getConnectionStatus,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getPendingRequests,
  getAcceptedConnections,
} from '@/services/connection-service'
import { getFriendProfile, getRoommateProfile } from '@/services/matching-service'
import type { Conversation, Message, ConversationMember, Profile, FriendProfile, FriendPreference, RoommateProfile, RoommatePreference } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type UserWithCompatibility = Profile & {
  friendProfile?: (FriendProfile & FriendPreference) | null
  roommateProfile?: (RoommateProfile & RoommatePreference) | null
}

type Tab = 'chats' | 'friends' | 'matches' | 'requests'

export default function ChatPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('chats')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [chatLoading, setChatLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [users, setUsers] = useState<UserWithCompatibility[]>([])
  const [matchLoading, setMatchLoading] = useState(true)
  const compatibilityType: CompatibilityType = 'general'
  const [myFriendProfile, setMyFriendProfile] = useState<(FriendProfile & FriendPreference) | null>(null)
  const [myRoommateProfile, setMyRoommateProfile] = useState<(RoommateProfile & RoommatePreference) | null>(null)
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'none' | 'pending' | 'accepted' | 'requested'>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserWithCompatibility | null>(null)

  const [pendingRequests, setPendingRequests] = useState<UserWithCompatibility[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)

  const [friends, setFriends] = useState<UserWithCompatibility[]>([])
  const [friendsLoading, setFriendsLoading] = useState(true)

  const supabase = createClient()

  const loadConversations = useCallback(async () => {
    try {
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
      setChatLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConversations()

    let subscription: { unsubscribe: () => void } | null = null
    const setupSubscription = async () => {
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
  }, [loadConversations, supabase])

  useEffect(() => {
    if (tab !== 'matches') return

    let cancelled = false

    async function loadMatches() {
      setMatchLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [friendProfile, roommateProfile] = await Promise.all([
          getFriendProfile(user.id),
          getRoommateProfile(user.id),
        ])

        const myFriend = friendProfile?.profile ? { ...friendProfile.profile, ...friendProfile.preferences } as FriendProfile & FriendPreference : null
        const myRoommate = roommateProfile?.profile ? { ...roommateProfile.profile, ...roommateProfile.preferences } as RoommateProfile & RoommatePreference : null

        setMyFriendProfile(myFriend)
        setMyRoommateProfile(myRoommate)

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .order('full_name', { ascending: true })

        if (!profiles || profiles.length === 0) {
          setUsers([])
          return
        }

        const userIds = profiles.map(p => p.id)

        const [friendProfiles, friendPreferences, roommateProfiles, roommatePreferences] = await Promise.all([
          supabase.from('friend_profiles').select('*').in('student_id', userIds),
          supabase.from('friend_preferences').select('*').in('student_id', userIds),
          supabase.from('roommate_profiles').select('*').in('student_id', userIds),
          supabase.from('roommate_preferences').select('*').in('student_id', userIds),
        ])

        const friendMap = new Map((friendProfiles.data || []).map(p => [p.student_id, p]))
        const friendPrefMap = new Map((friendPreferences.data || []).map(p => [p.student_id, p]))
        const roommateMap = new Map((roommateProfiles.data || []).map(p => [p.student_id, p]))
        const roommatePrefMap = new Map((roommatePreferences.data || []).map(p => [p.student_id, p]))

        const enriched: UserWithCompatibility[] = profiles.map(profile => ({
          ...profile,
          friendProfile: friendMap.has(profile.id) ? { ...friendMap.get(profile.id)!, ...friendPrefMap.get(profile.id)! } as FriendProfile & FriendPreference : null,
          roommateProfile: roommateMap.has(profile.id) ? { ...roommateMap.get(profile.id)!, ...roommatePrefMap.get(profile.id)! } as RoommateProfile & RoommatePreference : null,
        }))

        setUsers(enriched)

        const statuses: Record<string, 'none' | 'pending' | 'accepted' | 'requested'> = {}
        await Promise.all(
          enriched.map(async (u) => {
            statuses[u.id] = await getConnectionStatus(user.id, u.id)
          })
        )
        setConnectionStatuses(statuses)
      } catch (error) {
        console.error('Error loading matches:', error)
      } finally {
        if (!cancelled) {
          setMatchLoading(false)
        }
      }
    }

    loadMatches()

    return () => {
      cancelled = true
    }
  }, [tab, supabase])

  useEffect(() => {
    if (tab !== 'requests') return

    let cancelled = false

    async function loadRequests() {
      setRequestsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const pending = await getPendingRequests(user.id)

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', pending.map(p => p.user_a === user.id ? p.user_b : p.user_a))

        const enriched: UserWithCompatibility[] = (profiles || []).map(profile => ({
          ...profile,
          friendProfile: null,
          roommateProfile: null,
        }))

        if (!cancelled) {
          setPendingRequests(enriched)
        }
      } catch (error) {
        console.error('Error loading requests:', error)
      } finally {
        if (!cancelled) {
          setRequestsLoading(false)
        }
      }
    }

    loadRequests()

    return () => {
      cancelled = true
    }
  }, [tab, supabase])

  useEffect(() => {
    if (tab !== 'friends') return

    let cancelled = false

    async function loadFriends() {
      setFriendsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const accepted = await getAcceptedConnections(user.id)

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', accepted.map(c => c.user_a === user.id ? c.user_b : c.user_a))

        const enriched: UserWithCompatibility[] = (profiles || []).map(profile => ({
          ...profile,
          friendProfile: null,
          roommateProfile: null,
        }))

        if (!cancelled) {
          setFriends(enriched)
        }
      } catch (error) {
        console.error('Error loading friends:', error)
      } finally {
        if (!cancelled) {
          setFriendsLoading(false)
        }
      }
    }

    loadFriends()

    return () => {
      cancelled = true
    }
  }, [tab, supabase])

  const getCompatibilityScore = (user: UserWithCompatibility): number => {
    return getCompatibilityResult(compatibilityType, myFriendProfile, user.friendProfile || null, myRoommateProfile, user.roommateProfile || null).score
  }

  const getCompatibilityReasons = (user: UserWithCompatibility): string[] => {
    return getCompatibilityResult(compatibilityType, myFriendProfile, user.friendProfile || null, myRoommateProfile, user.roommateProfile || null).reasons
  }

  const topMatches = users
    .map(u => ({
      user: u,
      score: getCompatibilityScore(u),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  const handleConnect = async (targetId: string) => {
    if (!userId) return
    setActionLoading(targetId)
    await sendConnectionRequest(userId, targetId, 'friend')
    setConnectionStatuses(prev => ({ ...prev, [targetId]: 'requested' }))
    setActionLoading(null)
  }

  const handleRoommateRequest = async (targetId: string) => {
    if (!userId) return
    setActionLoading(targetId)
    await sendConnectionRequest(userId, targetId, 'study_buddy')
    setConnectionStatuses(prev => ({ ...prev, [targetId]: 'requested' }))
    setActionLoading(null)
  }

  const handleAccept = async (targetId: string) => {
    if (!userId) return
    setActionLoading(targetId)
    await acceptConnectionRequest(userId, targetId)
    setConnectionStatuses(prev => ({ ...prev, [targetId]: 'accepted' }))
    setPendingRequests(prev => prev.filter(u => u.id !== targetId))
    setActionLoading(null)
  }

  const handleReject = async (targetId: string) => {
    if (!userId) return
    setActionLoading(targetId)
    await rejectConnectionRequest(userId, targetId)
    setConnectionStatuses(prev => ({ ...prev, [targetId]: 'none' }))
    setPendingRequests(prev => prev.filter(u => u.id !== targetId))
    setActionLoading(null)
  }

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

  if (chatLoading) {
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
          </div>
          {tab === 'chats' && (
            <Button onClick={() => setIsNewChatOpen(true)} size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex bg-blue-100 rounded-3xl p-1 mb-6">
          <button
            onClick={() => setTab('chats')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all',
              tab === 'chats' ? 'bg-primary text-white shadow-sm hover:bg-primary/90' : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <MessageCircle className="h-4 w-4" />
            Chats
          </button>
          <button
            onClick={() => setTab('friends')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all',
              tab === 'friends' ? 'bg-primary text-white shadow-sm hover:bg-primary/90' : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <Users className="h-4 w-4" />
            Friends
          </button>
          <button
            onClick={() => setTab('matches')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all',
              tab === 'matches' ? 'bg-primary text-white shadow-sm hover:bg-primary/90' : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <UserCheck className="h-4 w-4" />
            Matches
          </button>
          <button
            onClick={() => setTab('requests')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all',
              tab === 'requests' ? 'bg-primary text-white shadow-sm hover:bg-primary/90' : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <UserPlus className="h-4 w-4" />
            Requests
            {pendingRequests.length > 0 && (
              <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {tab === 'chats' && (
          <div>
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
                        // eslint-disable-next-line @next/next/no-img-element
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
        )}

        {tab === 'friends' && (
          <div>
            {friendsLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-neutral-500">Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
                <Users className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No friends yet</p>
                <p className="text-sm text-neutral-400 mt-1">Accept connection requests to see them here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => {
                  const status = connectionStatuses[friend.id] || 'none'
                  return (
                    <div
                      key={friend.id}
                      className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(friend)}
                    >
                      <div className="relative">
                        {friend.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={friend.avatar_url} alt={friend.full_name || ''} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">{friend.full_name?.[0] || friend.username?.[0] || '?'}</span>
                          </div>
                        )}
                        {status === 'accepted' && (
                          <div className="absolute -bottom-0.5 -right-0.5">
                            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-green-500 border-2 border-white">
                              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-neutral-900 truncate">{friend.full_name || friend.username}</h3>
                        <p className="text-sm text-neutral-500 truncate">{friend.bio || 'No bio yet'}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/chat`)
                          }}
                          disabled={actionLoading === friend.id}
                        >
                          <MessageCircle className="h-5 w-5 text-primary" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'matches' && (
          <div>
            {matchLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-neutral-500">Loading matches...</p>
              </div>
            ) : topMatches.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
                <Users className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">Complete your profile to see matches</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topMatches.map(({ user: u, score }) => {
                  const status = connectionStatuses[u.id] || 'none'
                  return (
                    <div
                      key={u.id}
                      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      <div className="relative h-40 bg-neutral-100">
                         {u.avatar_url ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={u.avatar_url} alt={u.full_name || ''} className="h-full w-full object-cover" />
                         ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-4xl font-black text-neutral-200">{u.full_name?.[0] || u.username?.[0] || '?'}</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <MatchBadge score={score} size="sm" />
                        </div>
                        {status === 'accepted' && (
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              <CheckCircle2 className="h-3 w-3" />
                              Connected
                            </span>
                          </div>
                        )}
                        {status === 'pending' && (
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                              Pending
                            </span>
                          </div>
                        )}
                        {status === 'requested' && (
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                              Requested
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 md:p-5 space-y-2 md:space-y-3">
                        <div>
                          <h3 className="text-lg font-black text-neutral-900">{u.full_name || u.username}</h3>
                          <p className="text-sm text-neutral-500 line-clamp-2">{u.bio || 'No bio yet'}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                          {u.campus_id && (
                            <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-md">
                              <Users className="h-3 w-3" />
                              Same campus
                            </span>
                          )}
                          {(u.friendProfile as (FriendProfile & FriendPreference) | null | undefined)?.year_of_study && (
                            <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-md">
                              <Home className="h-3 w-3" />
                              Year {(u.friendProfile as (FriendProfile & FriendPreference)).year_of_study}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {getCompatibilityReasons(u).slice(0, 3).map((reason, i) => (
                            <span key={i} className="text-[10px] font-bold uppercase tracking-tight text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {reason}
                            </span>
                          ))}
                        </div>

                        {status === 'none' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleConnect(u.id)
                              }}
                              disabled={actionLoading === u.id}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Connect
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRoommateRequest(u.id)
                              }}
                              disabled={actionLoading === u.id}
                            >
                              <Home className="h-4 w-4 mr-1" />
                              Roommate
                            </Button>
                          </div>
                        )}
                        {status === 'accepted' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/chat`)
                              }}
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div>
            {requestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-neutral-500">Loading requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
                <CheckCircle2 className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No pending requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map(user => (
                  <div key={user.id} className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-4">
                     <div className="relative">
                       {user.avatar_url ? (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img src={user.avatar_url} alt={user.full_name || ''} className="h-12 w-12 rounded-full object-cover" />
                       ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">{user.full_name?.[0] || user.username?.[0] || '?'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-neutral-900 truncate">{user.full_name || user.username}</h3>
                      <p className="text-xs text-neutral-500">Wants to connect</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleAccept(user.id)} disabled={actionLoading === user.id}>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleReject(user.id)} disabled={actionLoading === user.id}>
                        <UserX className="h-5 w-5 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onChatCreated={(conversationId) => {
          setIsNewChatOpen(false)
          router.push(`/chat/${conversationId}`)
        }}
      />

      {selectedUser && (
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Profile">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {selectedUser.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedUser.avatar_url} alt={selectedUser.full_name || ''} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">{selectedUser.full_name?.[0] || selectedUser.username?.[0] || '?'}</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-neutral-900">{selectedUser.full_name || selectedUser.username}</h3>
                <p className="text-sm text-neutral-500">@{selectedUser.username}</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-neutral-400" />
                <span className="font-medium text-neutral-700">Campus</span>
                <span className="text-neutral-500">{selectedUser.campus_id ? 'Same institution' : 'Not specified'}</span>
              </div>
              {(() => {
                const userProfile = selectedUser as UserWithCompatibility
                const friendProfile = userProfile.friendProfile as (FriendProfile & FriendPreference) | null | undefined
                return (
                  <>
                    {friendProfile?.year_of_study && (
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-4 w-4 text-neutral-400" />
                        <span className="font-medium text-neutral-700">Year</span>
                        <span className="text-neutral-500">{friendProfile.year_of_study}</span>
                      </div>
                    )}
                    {friendProfile?.interests && friendProfile.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {friendProfile.interests.slice(0, 5).map((interest, i) => (
                          <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>

            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <X className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-yellow-800">Phone number and email are hidden until you connect</p>
            </div>

            <div className="flex gap-2 pt-2">
              {connectionStatuses[selectedUser.id] === 'none' && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleConnect(selectedUser.id)
                    }}
                    disabled={actionLoading === selectedUser.id}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      handleRoommateRequest(selectedUser.id)
                    }}
                    disabled={actionLoading === selectedUser.id}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Roommate Request
                  </Button>
                </>
              )}
              {connectionStatuses[selectedUser.id] === 'accepted' && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push(`/chat`)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat Now
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
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
                  // eslint-disable-next-line @next/next/no-img-element
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
