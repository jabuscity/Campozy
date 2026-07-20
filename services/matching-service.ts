/**
 * Matching Service
 *
 * Integrates the matching algorithm with Supabase.
 * Handles match computation, storage, and retrieval.
 */

import { createClient } from '@/lib/supabase/client';
import type {
  RoommateProfile,
  RoommatePreference,
  FriendProfile,
  FriendPreference,
  RoommateMatch,
  FriendMatch,
  RoommateInteraction,
  FriendInteraction,
  RoommateConversation,
  RoommateMessage,
  FriendConnection,
  MatchResult,
} from '@/types';
import { computeRoommateCompatibility, computeFriendCompatibility } from './matching-algorithm';

// ---------------------------------------------------------------------------
// Roommate Finder
// ---------------------------------------------------------------------------

export async function getRoommateProfile(studentId: string): Promise<{
  profile: RoommateProfile | null;
  preferences: RoommatePreference | null;
} | null> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('roommate_profiles')
    .select('*')
    .eq('student_id', studentId)
    .single();

  const { data: preferences } = await supabase
    .from('roommate_preferences')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (!profile) return null;

  return { profile, preferences };
}

export async function createOrUpdateRoommateProfile(
  data: Partial<RoommateProfile>
): Promise<RoommateProfile | null> {
  const supabase = createClient();

  const { data: result, error } = await supabase
    .from('roommate_profiles')
    .upsert(data, { onConflict: 'student_id' })
    .select()
    .single();

  if (error) {
    console.error('Error creating roommate profile:', error);
    return null;
  }

  return result;
}

export async function createOrUpdateRoommatePreferences(
  data: Partial<RoommatePreference>
): Promise<RoommatePreference | null> {
  const supabase = createClient();

  const { data: result, error } = await supabase
    .from('roommate_preferences')
    .upsert(data, { onConflict: 'student_id' })
    .select()
    .single();

  if (error) {
    console.error('Error creating roommate preferences:', error);
    return null;
  }

  return result;
}

export async function computeAndStoreRoommateMatches(
  seekerId: string
): Promise<RoommateMatch[]> {
  const supabase = createClient();

  const { data: seekerProfile } = await supabase
    .from('roommate_profiles')
    .select('*')
    .eq('student_id', seekerId)
    .single();

  const { data: seekerPrefs } = await supabase
    .from('roommate_preferences')
    .select('*')
    .eq('student_id', seekerId)
    .single();

  if (!seekerProfile || !seekerPrefs) return [];

  const { data: candidates } = await supabase
    .from('roommate_profiles')
    .select('*')
    .neq('student_id', seekerId)
    .eq('is_active', true)
    .limit(100);

  if (!candidates || candidates.length === 0) return [];

  const matches: RoommateMatch[] = [];

  for (const candidate of candidates) {
    const { data: candidatePrefs } = await supabase
      .from('roommate_preferences')
      .select('*')
      .eq('student_id', candidate.student_id)
      .single();

    if (!candidatePrefs) continue;

    const result: MatchResult = computeRoommateCompatibility({
      seeker: { ...seekerProfile, ...seekerPrefs },
      candidate: { ...candidate, ...candidatePrefs },
    });

    if (result.score < 20) continue;

    const { data: existing } = await supabase
      .from('roommate_matches')
      .select('id')
      .eq('seeker_id', seekerId)
      .eq('match_id', candidate.student_id)
      .single();

    if (existing) {
      await supabase
        .from('roommate_matches')
        .update({
          compatibility_score: result.score,
          match_reasons: result.reasons,
          budget_score: result.subScores.budget,
          lifestyle_score: result.subScores.lifestyle,
          location_score: result.subScores.location,
          academic_score: result.subScores.academic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('roommate_matches').insert({
        seeker_id: seekerId,
        match_id: candidate.student_id,
        compatibility_score: result.score,
        match_reasons: result.reasons,
        budget_score: result.subScores.budget,
        lifestyle_score: result.subScores.lifestyle,
        location_score: result.subScores.location,
        academic_score: result.subScores.academic,
      });
    }

    matches.push({
      id: existing?.id || crypto.randomUUID(),
      seeker_id: seekerId,
      match_id: candidate.student_id,
      compatibility_score: result.score,
      match_reasons: result.reasons,
      budget_score: result.subScores.budget ?? null,
      lifestyle_score: result.subScores.lifestyle ?? null,
      location_score: result.subScores.location ?? null,
      academic_score: result.subScores.academic ?? null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
}

export async function getRoommateMatches(
  seekerId: string,
  limit = 20,
  offset = 0
): Promise<RoommateMatch[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('roommate_matches')
    .select('*')
    .eq('seeker_id', seekerId)
    .order('compatibility_score', { ascending: false })
    .range(offset, offset + limit - 1);

  return data || [];
}

export async function recordRoommateInteraction(
  userId: string,
  targetId: string,
  type: RoommateInteraction['interaction_type'],
  notes?: string
): Promise<RoommateInteraction | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('roommate_interactions')
    .upsert(
      {
        user_id: userId,
        target_id: targetId,
        interaction_type: type,
        notes: notes || null,
      },
      { onConflict: 'user_id,target_id,interaction_type' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error recording interaction:', error);
    return null;
  }

  return data;
}

export async function getRoommateConversations(
  userId: string
): Promise<RoommateConversation[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('roommate_conversations')
    .select('*')
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .eq('is_active', true)
    .order('last_message_at', { ascending: false });

  return data || [];
}

export async function getOrCreateRoommateConversation(
  userA: string,
  userB: string
): Promise<RoommateConversation | null> {
  const supabase = createClient();
  const [a, b] = [userA, userB].sort();

  const { data } = await supabase
    .from('roommate_conversations')
    .select('*')
    .eq('participant_a', a)
    .eq('participant_b', b)
    .single();

  if (data) return data;

  const { data: created, error } = await supabase
    .from('roommate_conversations')
    .insert({ participant_a: a, participant_b: b })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return created;
}

export async function getRoommateMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<RoommateMessage[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('roommate_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  return data || [];
}

export async function sendRoommateMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<RoommateMessage | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('roommate_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  await supabase
    .from('roommate_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

// ---------------------------------------------------------------------------
// Friendfinder
// ---------------------------------------------------------------------------

export async function getFriendProfile(studentId: string): Promise<{
  profile: FriendProfile | null;
  preferences: FriendPreference | null;
} | null> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('friend_profiles')
    .select('*')
    .eq('student_id', studentId)
    .single();

  const { data: preferences } = await supabase
    .from('friend_preferences')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (!profile) return null;

  return { profile, preferences };
}

export async function createOrUpdateFriendProfile(
  data: Partial<FriendProfile>
): Promise<FriendProfile | null> {
  const supabase = createClient();

  const { data: result, error } = await supabase
    .from('friend_profiles')
    .upsert(data, { onConflict: 'student_id' })
    .select()
    .single();

  if (error) {
    console.error('Error creating friend profile:', error);
    return null;
  }

  return result;
}

export async function createOrUpdateFriendPreferences(
  data: Partial<FriendPreference>
): Promise<FriendPreference | null> {
  const supabase = createClient();

  const { data: result, error } = await supabase
    .from('friend_preferences')
    .upsert(data, { onConflict: 'student_id' })
    .select()
    .single();

  if (error) {
    console.error('Error creating friend preferences:', error);
    return null;
  }

  return result;
}

export async function computeAndStoreFriendMatches(
  seekerId: string
): Promise<FriendMatch[]> {
  const supabase = createClient();

  const { data: seekerProfile } = await supabase
    .from('friend_profiles')
    .select('*')
    .eq('student_id', seekerId)
    .single();

  const { data: seekerPrefs } = await supabase
    .from('friend_preferences')
    .select('*')
    .eq('student_id', seekerId)
    .single();

  if (!seekerProfile || !seekerPrefs) return [];

  const { data: candidates } = await supabase
    .from('friend_profiles')
    .select('*')
    .neq('student_id', seekerId)
    .eq('is_active', true)
    .limit(100);

  if (!candidates || candidates.length === 0) return [];

  const matches: FriendMatch[] = [];

  for (const candidate of candidates) {
    const { data: candidatePrefs } = await supabase
      .from('friend_preferences')
      .select('*')
      .eq('student_id', candidate.student_id)
      .single();

    if (!candidatePrefs) continue;

    const result: MatchResult = computeFriendCompatibility({
      seeker: { ...seekerProfile, ...seekerPrefs },
      candidate: { ...candidate, ...candidatePrefs },
    });

    if (result.score < 20) continue;

    const { data: existing } = await supabase
      .from('friend_matches')
      .select('id')
      .eq('seeker_id', seekerId)
      .eq('match_id', candidate.student_id)
      .single();

    if (existing) {
      await supabase
        .from('friend_matches')
        .update({
          compatibility_score: result.score,
          match_reasons: result.reasons,
          academic_score: result.subScores.academic,
          interest_score: result.subScores.interests,
          social_score: result.subScores.social,
          proximity_score: result.subScores.proximity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('friend_matches')
        .insert({
          seeker_id: seekerId,
          match_id: candidate.student_id,
          compatibility_score: result.score,
          match_reasons: result.reasons,
          academic_score: result.subScores.academic,
          interest_score: result.subScores.interests,
          social_score: result.subScores.social,
          proximity_score: result.subScores.proximity,
        });
    }

    matches.push({
      id: existing?.id || crypto.randomUUID(),
      seeker_id: seekerId,
      match_id: candidate.student_id,
      compatibility_score: result.score,
      match_reasons: result.reasons,
      academic_score: result.subScores.academic ?? null,
      interest_score: result.subScores.interests ?? null,
      social_score: result.subScores.social ?? null,
      proximity_score: result.subScores.proximity ?? null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
}

export async function getFriendMatches(
  seekerId: string,
  limit = 20,
  offset = 0
): Promise<FriendMatch[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('friend_matches')
    .select('*')
    .eq('seeker_id', seekerId)
    .order('compatibility_score', { ascending: false })
    .range(offset, offset + limit - 1);

  return data || [];
}

export async function recordFriendInteraction(
  userId: string,
  targetId: string,
  type: FriendInteraction['interaction_type'],
  notes?: string
): Promise<FriendInteraction | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('friend_interactions')
    .upsert(
      {
        user_id: userId,
        target_id: targetId,
        interaction_type: type,
        notes: notes || null,
      },
      { onConflict: 'user_id,target_id,interaction_type' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error recording friend interaction:', error);
    return null;
  }

  return data;
}

export async function getFriendConnections(
  userId: string
): Promise<FriendConnection[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('friend_connections')
    .select('*')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .eq('is_active', true);

  return data || [];
}

export async function createFriendConnection(
  userA: string,
  userB: string,
  connectionType: FriendConnection['connection_type'] = 'friend'
): Promise<FriendConnection | null> {
  const supabase = createClient();
  const [a, b] = [userA, userB].sort();

  const { data, error } = await supabase
    .from('friend_connections')
    .insert({ user_a: a, user_b: b, connection_type: connectionType })
    .select()
    .single();

  if (error) {
    console.error('Error creating friend connection:', error);
    return null;
  }

  return data;
}
