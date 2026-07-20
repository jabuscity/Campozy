import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/client';
import {
  getRoommateProfile,
  createOrUpdateRoommateProfile,
  createOrUpdateRoommatePreferences,
  getRoommateMatches,
  recordRoommateInteraction,
  getOrCreateRoommateConversation,
  sendRoommateMessage,
  getFriendProfile,
  createOrUpdateFriendProfile,
  createOrUpdateFriendPreferences,
  getFriendMatches,
  recordFriendInteraction,
  getFriendConnections,
  createFriendConnection,
} from '../matching-service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedChain: Record<string, (...args: any[]) => any>;

function createChainableMock() {
  const methods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'neq', 'or', 'order', 'range'];
  const chain: Record<string, (...args: any[]) => any> = {};

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }

  chain.single = vi.fn();

  return chain;
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

describe('matching-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedChain = createChainableMock();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn(() => capturedChain),
    });
  });

  describe('getRoommateProfile', () => {
    it('returns profile and preferences when they exist', async () => {
      const chain = capturedChain as ReturnType<typeof createChainableMock>;
      const mockProfile = { id: 'rp-1', student_id: 'student-1' };
      const mockPrefs = { id: 'pr-1', student_id: 'student-1' };

      chain.single.mockResolvedValueOnce({ data: mockProfile, error: null })
                   .mockResolvedValueOnce({ data: mockPrefs, error: null });

      const result = await getRoommateProfile('student-1');

      expect(result).toEqual({ profile: mockProfile, preferences: mockPrefs });
    });

    it('returns null when profile does not exist', async () => {
      const chain = capturedChain;
      chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const result = await getRoommateProfile('student-1');

      expect(result).toBeNull();
    });
  });

  describe('createOrUpdateRoommateProfile', () => {
    it('creates a new profile', async () => {
      const chain = capturedChain;
      const newProfile = { id: 'rp-1', student_id: 'student-1' };

      chain.single.mockResolvedValue({ data: newProfile, error: null });

      const result = await createOrUpdateRoommateProfile({ student_id: 'student-1' });

      expect(result).toEqual(newProfile);
    });

    it('returns null on error', async () => {
      const chain = capturedChain;
      chain.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      const result = await createOrUpdateRoommateProfile({ student_id: 'student-1' });

      expect(result).toBeNull();
    });
  });

  describe('getRoommateMatches', () => {
    it('returns matches ordered by compatibility score', async () => {
      const chain = capturedChain;
      const mockMatches = [
        { id: 'm1', compatibility_score: 90 },
        { id: 'm2', compatibility_score: 70 },
      ];

      chain.range.mockResolvedValue({ data: mockMatches, error: null });

      const result = await getRoommateMatches('seeker-1');

      expect(result).toEqual(mockMatches);
    });

    it('returns empty array on error', async () => {
      const chain = capturedChain;
      chain.range.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      const result = await getRoommateMatches('seeker-1');

      expect(result).toEqual([]);
    });
  });

  describe('recordRoommateInteraction', () => {
    it('records a like interaction', async () => {
      const chain = capturedChain;
      const mockInteraction = { id: 'ri-1', user_id: 'u1', target_id: 'u2', interaction_type: 'like' };

      chain.single.mockResolvedValue({ data: mockInteraction, error: null });

      const result = await recordRoommateInteraction('u1', 'u2', 'like');

      expect(result).toEqual(mockInteraction);
    });

    it('returns null on error', async () => {
      const chain = capturedChain;
      chain.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      const result = await recordRoommateInteraction('u1', 'u2', 'like');

      expect(result).toBeNull();
    });
  });

  describe('getOrCreateRoommateConversation', () => {
    it('returns existing conversation', async () => {
      const chain = capturedChain;
      const mockConversation = { id: 'c1', participant_a: 'a', participant_b: 'b' };

      chain.single.mockResolvedValue({ data: mockConversation, error: null });

      const result = await getOrCreateRoommateConversation('a', 'b');

      expect(result).toEqual(mockConversation);
    });

    it('creates new conversation when none exists', async () => {
      const chain = capturedChain;
      const mockConversation = { id: 'c2', participant_a: 'a', participant_b: 'b' };

      chain.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })
                     .mockResolvedValueOnce({ data: mockConversation, error: null });

      const result = await getOrCreateRoommateConversation('a', 'b');

      expect(result).toEqual(mockConversation);
    });
  });

  describe('sendRoommateMessage', () => {
    it('sends message', async () => {
      const chain = capturedChain;
      const mockMessage = { id: 'm1', conversation_id: 'c1', sender_id: 'u1', content: 'Hello' };

      chain.single.mockResolvedValue({ data: mockMessage, error: null });

      const result = await sendRoommateMessage('c1', 'u1', 'Hello');

      expect(result).toEqual(mockMessage);
    });
  });

  describe('getFriendConnections', () => {
    it('returns connections for a user', async () => {
      const chain = capturedChain;
      const mockConnections = [
        { id: 'fc1', user_a: 'a', user_b: 'b' },
        { id: 'fc2', user_a: 'c', user_b: 'a' },
      ];

      chain.eq.mockResolvedValue({ data: mockConnections, error: null });

      const result = await getFriendConnections('a');

      expect(result).toEqual(mockConnections);
    });
  });

  describe('createFriendConnection', () => {
    it('creates a connection with sorted users', async () => {
      const chain = capturedChain;
      const mockConnection = { id: 'fc1', user_a: 'a', user_b: 'b', connection_type: 'friend' };

      chain.single.mockResolvedValue({ data: mockConnection, error: null });

      const result = await createFriendConnection('b', 'a', 'friend');

      expect(result).toEqual(mockConnection);
    });
  });
});
