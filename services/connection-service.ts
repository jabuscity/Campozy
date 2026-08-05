import { createClient } from '@/lib/supabase/client'
import type { FriendConnectionType, FriendConnection } from '@/types'

export async function sendConnectionRequest(
  userId: string,
  targetId: string,
  connectionType: FriendConnectionType = 'friend'
): Promise<FriendConnection | null> {
  const supabase = createClient()

  const [a, b] = [userId, targetId].sort()

  const { data, error } = await supabase
    .from('friend_connections')
    .insert({
      user_a: a,
      user_b: b,
      connection_type: connectionType,
      is_active: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to send connection request:', error)
    return null
  }

  return data as FriendConnection
}

export async function acceptConnectionRequest(
  userId: string,
  targetId: string
): Promise<FriendConnection | null> {
  const supabase = createClient()

  const [a, b] = [userId, targetId].sort()

  const { data, error } = await supabase
    .from('friend_connections')
    .update({ is_active: true })
    .eq('user_a', a)
    .eq('user_b', b)
    .select()
    .single()

  if (error) {
    console.error('Failed to accept connection request:', error)
    return null
  }

  return data as FriendConnection
}

export async function rejectConnectionRequest(
  userId: string,
  targetId: string
): Promise<void> {
  const supabase = createClient()

  const [a, b] = [userId, targetId].sort()

  const { error } = await supabase
    .from('friend_connections')
    .delete()
    .eq('user_a', a)
    .eq('user_b', b)

  if (error) {
    console.error('Failed to reject connection request:', error)
  }
}

export async function getConnectionStatus(
  userId: string,
  targetId: string
): Promise<'none' | 'pending' | 'accepted' | 'requested'> {
  const supabase = createClient()

  const [a, b] = [userId, targetId].sort()

  const { data, error } = await supabase
    .from('friend_connections')
    .select('user_a, user_b, is_active')
    .eq('user_a', a)
    .eq('user_b', b)
    .maybeSingle()

  if (error || !data) return 'none'

  if (data.is_active) return 'accepted'

  if (data.user_a === userId) return 'requested'
  return 'pending'
}

export async function getPendingRequests(userId: string): Promise<FriendConnection[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('friend_connections')
    .select('*')
    .eq('user_b', userId)
    .eq('is_active', false)

  if (error) {
    console.error('Failed to fetch pending requests:', error)
    return []
  }

  return (data || []) as FriendConnection[]
}
