import { describe, it, expect } from 'vitest';
import {
  computeRoommateCompatibility,
  computeFriendCompatibility,
} from '../matching-algorithm';
import type {
  RoommateProfile,
  RoommatePreference,
  FriendProfile,
  FriendPreference,
} from '@/types';

function createRoommateSeeker(overrides?: Partial<RoommateProfile & RoommatePreference>): RoommateProfile & RoommatePreference {
  return {
    id: 'seeker-1',
    student_id: 'seeker-1',
    bio: null,
    year_of_study: 2,
    age: 21,
    university_id: 'uni-1',
    campus_id: 'campus-1',
    neighborhood_id: 'neighborhood-1',
    budget_range: [15000, 25000],
    sleep_schedule: 'early_bird',
    cleanliness_level: 'neat',
    social_level: 'moderate',
    study_habits: 'silent',
    gender_preference: 'any',
    dietary_preferences: [],
    interests: ['coding', 'hiking'],
    smoking_ok: false,
    pets_ok: true,
    max_roommates: 1,
    move_in_date: '2026-09-01',
    lease_duration_months: 12,
    is_active: true,
    campozy_score: 75,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    budget_min: 15000,
    budget_max: 25000,
    preferred_campus_id: 'campus-1',
    preferred_neighborhood_ids: ['neighborhood-1'],
    ...overrides,
  };
}

function createRoommateCandidate(overrides?: Partial<RoommateProfile & RoommatePreference>): RoommateProfile & RoommatePreference {
  return {
    id: 'candidate-1',
    student_id: 'candidate-1',
    bio: null,
    year_of_study: 2,
    age: 20,
    university_id: 'uni-1',
    campus_id: 'campus-1',
    neighborhood_id: 'neighborhood-1',
    budget_range: [18000, 22000],
    sleep_schedule: 'early_bird',
    cleanliness_level: 'neat',
    social_level: 'moderate',
    study_habits: 'silent',
    gender_preference: 'any',
    dietary_preferences: [],
    interests: ['coding', 'hiking'],
    smoking_ok: false,
    pets_ok: true,
    max_roommates: 1,
    move_in_date: '2026-09-01',
    lease_duration_months: 12,
    is_active: true,
    campozy_score: 80,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    budget_min: 15000,
    budget_max: 25000,
    preferred_campus_id: 'campus-1',
    preferred_neighborhood_ids: ['neighborhood-1'],
    ...overrides,
  };
}

describe('matching-algorithm', () => {
  describe('computeRoommateCompatibility', () => {
    it('returns a perfect or near-perfect score for identical profiles', () => {
      const seeker = createRoommateSeeker();
      const candidate = createRoommateCandidate();

      const result = computeRoommateCompatibility({ seeker, candidate });

      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.subScores.budget).toBeDefined();
      expect(result.subScores.lifestyle).toBeDefined();
      expect(result.subScores.location).toBeDefined();
      expect(result.subScores.academic).toBeDefined();
      expect(result.subScores.interests).toBeDefined();
    });

    it('returns score 0 when hard filters fail (smoking)', () => {
      const seeker = createRoommateSeeker({ smoking_ok: false });
      const candidate = createRoommateCandidate({ smoking_ok: true });

      const result = computeRoommateCompatibility({ seeker, candidate });

      expect(result.score).toBe(0);
      expect(result.reasons).toContain('Does not meet your hard requirements');
    });

    it('returns score 0 when hard filters fail (pets)', () => {
      const seeker = createRoommateSeeker({ pets_ok: false });
      const candidate = createRoommateCandidate({ pets_ok: true });

      const result = computeRoommateCompatibility({ seeker, candidate });

      expect(result.score).toBe(0);
      expect(result.reasons).toContain('Does not meet your hard requirements');
    });

    it('returns score 0 when budgets do not overlap', () => {
      const seeker = createRoommateSeeker({ budget_min: 10000, budget_max: 15000 });
      const candidate = createRoommateCandidate({ budget_range: [20000, 30000] });

      const result = computeRoommateCompatibility({ seeker, candidate });

      expect(result.score).toBe(0);
    });

    it('returns lower score for different campuses', () => {
      const seeker = createRoommateSeeker({ campus_id: 'campus-1' });
      const candidate = createRoommateCandidate({ campus_id: 'campus-2' });

      const result = computeRoommateCompatibility({ seeker, candidate });

      expect(result.score).toBeLessThan(70);
    });

    it('returns neutral score when data is missing', () => {
      const seeker = createRoommateSeeker({
        budget_min: null,
        budget_max: null,
        budget_range: null,
        campus_id: null,
        university_id: null,
        year_of_study: null,
        interests: [],
      });
      const candidate = createRoommateCandidate({
        budget_range: null,
        campus_id: null,
        university_id: null,
        year_of_study: null,
        interests: [],
      });

      const result = computeRoommateCompatibility({ seeker, candidate });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('caps score at 100', () => {
      const seeker = createRoommateSeeker();
      const candidate = createRoommateCandidate({
        sleep_schedule: 'early_bird',
        cleanliness_level: 'neat',
        social_level: 'moderate',
        study_habits: 'silent',
        interests: ['coding', 'hiking', 'reading', 'gaming'],
      });

      const result = computeRoommateCompatibility({ seeker, candidate });

      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('computeFriendCompatibility', () => {
    function createFriendSeeker(overrides?: Partial<FriendProfile & FriendPreference>): FriendProfile & FriendPreference {
      return {
        id: 'seeker-1',
        student_id: 'seeker-1',
        bio: null,
        year_of_study: 2,
        university_id: 'uni-1',
        campus_id: 'campus-1',
        personality_type: 'introvert',
        interests: ['coding', 'hiking'],
        hobbies: ['gaming'],
        study_habits: 'silent',
        availability_windows: ['morning'],
        is_active: true,
        campozy_score: 75,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        preferred_campus_id: 'campus-1',
        preferred_program_ids: [],
        preferred_interest_ids: [],
        preferred_personality_types: [],
        max_distance_km: 10,
        study_together_ok: true,
        event_attendance_ok: true,
        gaming_ok: true,
        fitness_ok: true,
        ...overrides,
      };
    }

    function createFriendCandidate(overrides?: Partial<FriendProfile & FriendPreference>): FriendProfile & FriendPreference {
      return {
        id: 'candidate-1',
        student_id: 'candidate-1',
        bio: null,
        year_of_study: 2,
        university_id: 'uni-1',
        campus_id: 'campus-1',
        personality_type: 'introvert',
        interests: ['coding', 'hiking'],
        hobbies: ['gaming'],
        study_habits: 'silent',
        availability_windows: ['morning'],
        is_active: true,
        campozy_score: 80,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        preferred_campus_id: 'campus-1',
        preferred_program_ids: [],
        preferred_interest_ids: [],
        preferred_personality_types: [],
        max_distance_km: 10,
        study_together_ok: true,
        event_attendance_ok: true,
        gaming_ok: true,
        fitness_ok: true,
        ...overrides,
      };
    }

    it('returns a high score for identical profiles', () => {
      const seeker = createFriendSeeker();
      const candidate = createFriendCandidate();

      const result = computeFriendCompatibility({ seeker, candidate });

      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('returns score 0 when campus preference does not match', () => {
      const seeker = createFriendSeeker({ preferred_campus_id: 'campus-1' });
      const candidate = createFriendCandidate({ campus_id: 'campus-2' });

      const result = computeFriendCompatibility({ seeker, candidate });

      expect(result.score).toBe(0);
      expect(result.reasons).toContain('Does not match your friend preferences');
    });

    it('returns score 0 when candidate campus does not match preference', () => {
      const seeker = createFriendSeeker({ preferred_campus_id: 'campus-1' });
      const candidate = createFriendCandidate({ campus_id: 'campus-2' });

      const result = computeFriendCompatibility({ seeker, candidate });

      expect(result.score).toBe(0);
    });

    it('gives higher score for same personality type', () => {
      const baseSeeker: FriendProfile & FriendPreference = {
        id: 'seeker-1',
        student_id: 'seeker-1',
        bio: null,
        year_of_study: 2,
        university_id: 'uni-1',
        campus_id: 'campus-1',
        personality_type: 'introvert',
        interests: ['coding'],
        hobbies: [],
        study_habits: 'silent',
        availability_windows: [],
        is_active: true,
        campozy_score: 75,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        preferred_campus_id: 'campus-1',
        preferred_program_ids: [],
        preferred_interest_ids: [],
        preferred_personality_types: [],
        max_distance_km: 10,
        study_together_ok: true,
        event_attendance_ok: true,
        gaming_ok: true,
        fitness_ok: true,
      };

      const candidateSame = { ...baseSeeker, id: 'c1', student_id: 'c1', personality_type: 'introvert' as const };
      const candidateDiff = { ...baseSeeker, id: 'c2', student_id: 'c2', personality_type: 'extrovert' as const };

      const resultSame = computeFriendCompatibility({ seeker: baseSeeker, candidate: candidateSame });
      const resultDiff = computeFriendCompatibility({ seeker: baseSeeker, candidate: candidateDiff });

      expect(resultSame.score).toBeGreaterThan(resultDiff.score);
    });

    it('caps score at 100', () => {
      const seeker = createFriendSeeker();
      const candidate = createFriendCandidate({
        interests: ['coding', 'hiking', 'reading', 'gaming', 'music'],
      });

      const result = computeFriendCompatibility({ seeker, candidate });

      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
