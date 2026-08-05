'use client'

import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MatchBadge } from '@/components/matching/match-badge'
import {
  Search,
  UserPlus,
  Home,
  GraduationCap,
  MapPin,
  MessageCircle,
  Filter,
  X,
  Loader2,
  CheckCircle2,
  UserCheck,
  UserX,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, FriendProfile, FriendPreference, RoommateProfile, RoommatePreference } from '@/types'
import { getCompatibilityResult, type CompatibilityType } from '@/services/compatibility-service'
import { getConnectionStatus, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, getPendingRequests } from '@/services/connection-service'
import { getFriendProfile, getRoommateProfile } from '@/services/matching-service'

interface UserWithCompatibility extends Profile {
  friendProfile?: FriendProfile & FriendPreference
  roommateProfile?: RoommateProfile & RoommatePreference
}

export default function ConnectionsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithCompatibility[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithCompatibility[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [campusFilter, setCampusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'name' | 'compatibility'>('name')
  const [compatibilityType, setCompatibilityType] = useState<CompatibilityType>('general')
  const [selectedUser, setSelectedUser] = useState<UserWithCompatibility | null>(null)
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'none' | 'pending' | 'accepted' | 'requested'>>({})
  const [pendingRequests, setPendingRequests] = useState<UserWithCompatibility[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [myFriendProfile, setMyFriendProfile] = useState<(FriendProfile & FriendPreference) | null>(null)
  const [myRoommateProfile, setMyRoommateProfile] = useState<(RoommateProfile & RoommatePreference) | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([])
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const supabase = createClient()

  const loadCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    const [friendProfile, roommateProfile] = await Promise.all([
      getFriendProfile(user.id),
      getRoommateProfile(user.id),
    ])

    setMyFriendProfile(friendProfile?.profile ? { ...friendProfile.profile, ...friendProfile.preferences } as FriendProfile & FriendPreference : null)
    setMyRoommateProfile(roommateProfile?.profile ? { ...roommateProfile.profile, ...roommateProfile.preferences } as RoommateProfile & RoommatePreference : null)
  }, [router, supabase])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('full_name', { ascending: true })

      if (!profiles || profiles.length === 0) {
        setUsers([])
        setFilteredUsers([])
        return
      }

      const userIds = profiles.map(p => p.id)

      const [friendProfiles, friendPreferences, roommateProfiles, roommatePreferences, campusData] = await Promise.all([
        supabase.from('friend_profiles').select('*').in('student_id', userIds),
        supabase.from('friend_preferences').select('*').in('student_id', userIds),
        supabase.from('roommate_profiles').select('*').in('student_id', userIds),
        supabase.from('roommate_preferences').select('*').in('student_id', userIds),
        supabase.from('campuses').select('id, name'),
      ])

      if (campusData.data) {
        setCampuses(campusData.data)
      }

      const friendMap = new Map((friendProfiles.data || []).map(p => [p.student_id, p]))
      const friendPrefMap = new Map((friendPreferences.data || []).map(p => [p.student_id, p]))
      const roommateMap = new Map((roommateProfiles.data || []).map(p => [p.student_id, p]))
      const roommatePrefMap = new Map((roommatePreferences.data || []).map(p => [p.student_id, p]))

      const enriched: UserWithCompatibility[] = profiles.map(profile => ({
        ...profile,
        friendProfile: friendMap.has(profile.id) ? { ...friendMap.get(profile.id)!, ...friendPrefMap.get(profile.id)! } as FriendProfile & FriendPreference : undefined,
        roommateProfile: roommateMap.has(profile.id) ? { ...roommateMap.get(profile.id)!, ...roommatePrefMap.get(profile.id)! } as RoommateProfile & RoommatePreference : undefined,
      }))

      setUsers(enriched)
      setFilteredUsers(enriched)

      const statuses: Record<string, 'none' | 'pending' | 'accepted' | 'requested'> = {}
      await Promise.all(
        enriched.map(async (u) => {
          statuses[u.id] = await getConnectionStatus(user.id, u.id)
        })
      )
      setConnectionStatuses(statuses)

      const pending = await getPendingRequests(user.id)
      const pendingUsers = enriched.filter(u => pending.some(p => p.user_b === user.id && (p.user_a === u.id || p.user_b === u.id)))
      setPendingRequests(pendingUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    loadCurrentUser()
    loadUsers()
  }, [loadCurrentUser, loadUsers])

  useEffect(() => {
    if (!mountedRef.current) return
    let result = users

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(u =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.bio || '').toLowerCase().includes(q)
      )
    }

    if (campusFilter) {
      result = result.filter(u => u.campus_id === campusFilter)
    }

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
    } else if (sortBy === 'compatibility' && userId) {
      result = [...result].sort((a, b) => {
        const scoreA = getCompatibilityResult(compatibilityType, myFriendProfile, a.friendProfile || null, myRoommateProfile, a.roommateProfile || null).score
        const scoreB = getCompatibilityResult(compatibilityType, myFriendProfile, b.friendProfile || null, myRoommateProfile, b.roommateProfile || null).score
        return scoreB - scoreA
      })
    }

    setFilteredUsers(result)
  }, [users, searchQuery, campusFilter, sortBy, compatibilityType, userId, myFriendProfile, myRoommateProfile])

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

  const getCompatibilityScore = (user: UserWithCompatibility): number => {
    return getCompatibilityResult(compatibilityType, myFriendProfile, user.friendProfile || null, myRoommateProfile, user.roommateProfile || null).score
  }

  const getCompatibilityReasons = (user: UserWithCompatibility): string[] => {
    return getCompatibilityResult(compatibilityType, myFriendProfile, user.friendProfile || null, myRoommateProfile, user.roommateProfile || null).reasons
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">Connections</h1>
            <p className="text-neutral-500 text-sm mt-1">Discover and connect with students at your institution</p>
          </div>
          {pendingRequests.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <UserCheck className="h-4 w-4 mr-2" />
              {pendingRequests.length} Pending
            </Button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                placeholder="Search by name, username, or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Campuses</option>
                {campuses.map(campus => (
                  <option key={campus.id} value={campus.id}>{campus.name}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'compatibility')}
                className="px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="compatibility">Sort by Compatibility</option>
              </select>
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <div className="flex flex-wrap gap-2">
                {(['general', 'social', 'scholarly', 'roommate'] as CompatibilityType[]).map(type => (
                  <Button
                    key={type}
                    variant={compatibilityType === type ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCompatibilityType(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {pendingRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-black text-neutral-900 mb-3">Pending Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map(user => (
                <div key={user.id} className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-4">
                  <div className="relative">
                    {user.avatar_url ? (
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
          </div>
        )}

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
            <Search className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No users found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredUsers.map(user => {
              const status = connectionStatuses[user.id] || 'none'
              const score = getCompatibilityScore(user)
              const reasons = getCompatibilityReasons(user)

              return (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="relative h-40 bg-neutral-100">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || ''} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-4xl font-black text-neutral-200">{user.full_name?.[0] || user.username?.[0] || '?'}</span>
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
                      <h3 className="text-lg font-black text-neutral-900">{user.full_name || user.username}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{user.bio || 'No bio yet'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                      {user.campus_id && (
                        <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-md">
                          <MapPin className="h-3 w-3" />
                          Same campus
                        </span>
                      )}
                      {user.friendProfile?.year_of_study && (
                        <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded-md">
                          <GraduationCap className="h-3 w-3" />
                          Year {user.friendProfile.year_of_study}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {reasons.slice(0, 3).map((reason, i) => (
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
                            handleConnect(user.id)
                          }}
                          disabled={actionLoading === user.id}
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
                            handleRoommateRequest(user.id)
                          }}
                          disabled={actionLoading === user.id}
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

      {selectedUser && (
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Profile">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {selectedUser.avatar_url ? (
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
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span className="font-medium text-neutral-700">Campus</span>
                <span className="text-neutral-500">{selectedUser.campus_id ? 'Same institution' : 'Not specified'}</span>
              </div>
              {selectedUser.friendProfile?.year_of_study && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-neutral-400" />
                  <span className="font-medium text-neutral-700">Year</span>
                  <span className="text-neutral-500">{selectedUser.friendProfile.year_of_study}</span>
                </div>
              )}
              {selectedUser.friendProfile?.interests && selectedUser.friendProfile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUser.friendProfile.interests.slice(0, 5).map((interest, i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
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
