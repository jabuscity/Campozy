/**
 * Matching Algorithm — Pure Functions
 *
 * These functions contain no Supabase dependency and are easily testable.
 * They compute compatibility scores between two users based on their
 * roommate or friend profiles and preferences.
 *
 * Design principles:
 * - Weighted scoring with hard filters applied first
 * - Transparent reasons for every match
 * - Deterministic output for same inputs
 */

import type {
  RoommateProfile,
  RoommatePreference,
  FriendProfile,
  FriendPreference,
  MatchResult,
  RoommateCompatibilityInput,
  FriendCompatibilityInput,
} from '@/types';

// ---------------------------------------------------------------------------
// Roommate Matching
// ---------------------------------------------------------------------------

export function computeRoommateCompatibility(
  input: RoommateCompatibilityInput
): MatchResult {
  const { seeker, candidate } = input;
  const reasons: string[] = [];
  const subScores: MatchResult['subScores'] = {};

  // Hard filters — if any fail, score is 0
  if (!hardFiltersPass(seeker, candidate)) {
    return { score: 0, reasons: ['Does not meet your hard requirements'], subScores: {} };
  }

  // Budget overlap: 0–25 points
  const budgetScore = computeBudgetScore(seeker, candidate);
  subScores.budget = budgetScore;
  if (budgetScore >= 20) reasons.push('Budget ranges align well');
  else if (budgetScore >= 10) reasons.push('Some budget overlap');

  // Lifestyle alignment: 0–25 points
  const lifestyleScore = computeLifestyleScore(seeker, candidate);
  subScores.lifestyle = lifestyleScore;
  if (lifestyleScore >= 20) reasons.push('Lifestyles are very compatible');
  else if (lifestyleScore >= 10) reasons.push('Some lifestyle similarities');

  // Location proximity: 0–20 points
  const locationScore = computeLocationScore(seeker, candidate);
  subScores.location = locationScore;
  if (locationScore >= 15) reasons.push('Same campus/neighborhood');
  else if (locationScore >= 8) reasons.push('Nearby campus');

  // Academic overlap: 0–15 points
  const academicScore = computeAcademicScore(seeker, candidate);
  subScores.academic = academicScore;
  if (academicScore >= 12) reasons.push('Similar academic stage');
  else if (academicScore >= 6) reasons.push('Same university');

  // Interest/hobby overlap: 0–15 points
  const interestScore = computeInterestScore(seeker, candidate);
  subScores.interests = interestScore;
  if (interestScore >= 12) reasons.push('Many shared interests');
  else if (interestScore >= 6) reasons.push('Some common interests');

  const total = sumScores(subScores);

  return {
    score: Math.min(total, 100),
    reasons: reasons.length > 0 ? reasons : ['Potential match'],
    subScores,
  };
}

function hardFiltersPass(
  seeker: RoommateProfile & RoommatePreference,
  candidate: RoommateProfile & RoommatePreference
): boolean {
  // Gender preference
  if (seeker.gender_preference !== 'any' && candidate.gender_preference !== 'any') {
    // Both have preferences; in a real system we'd check actual gender.
    // For now we skip this filter since we don't store gender in the schema.
  }

  // Smoking
  if (seeker.smoking_ok === false && candidate.smoking_ok === true) {
    return false;
  }

  // Pets
  if (seeker.pets_ok === false && candidate.pets_ok === true) {
    return false;
  }

  // Budget overlap
  if (
    seeker.budget_min !== null &&
    seeker.budget_max !== null &&
    candidate.budget_range !== null
  ) {
    const [cMin, cMax] = candidate.budget_range;
    if (cMax < seeker.budget_min || cMin > seeker.budget_max) {
      return false;
    }
  }

  return true;
}

function computeBudgetScore(
  seeker: RoommateProfile & RoommatePreference,
  candidate: RoommateProfile & RoommatePreference
): number {
  if (
    !seeker.budget_min ||
    !seeker.budget_max ||
    !candidate.budget_range
  ) {
    return 10; // neutral if missing data
  }

  const [cMin, cMax] = candidate.budget_range;
  const overlapMin = Math.max(seeker.budget_min, cMin);
  const overlapMax = Math.min(seeker.budget_max, cMax);

  if (overlapMax < overlapMin) return 0;

  const overlap = overlapMax - overlapMin;
  const seekerRange = seeker.budget_max - seeker.budget_min;
  const ratio = seekerRange > 0 ? overlap / seekerRange : 0;

  return Math.round(ratio * 25);
}

function computeLifestyleScore(
  seeker: RoommateProfile & RoommatePreference,
  candidate: RoommateProfile & RoommatePreference
): number {
  let score = 0;

  if (seeker.sleep_schedule === candidate.sleep_schedule) score += 8;
  if (seeker.cleanliness_level === candidate.cleanliness_level) score += 8;
  if (seeker.social_level === candidate.social_level) score += 5;
  if (seeker.study_habits === candidate.study_habits) score += 4;

  return Math.min(score, 25);
}

function computeLocationScore(
  seeker: RoommateProfile & RoommatePreference,
  candidate: RoommateProfile & RoommatePreference
): number {
  if (seeker.campus_id && candidate.campus_id && seeker.campus_id === candidate.campus_id) {
    return 20;
  }

  if (
    seeker.preferred_campus_id &&
    candidate.campus_id &&
    seeker.preferred_campus_id === candidate.campus_id
  ) {
    return 15;
  }

  if (
    seeker.preferred_neighborhood_ids.length > 0 &&
    candidate.neighborhood_id &&
    seeker.preferred_neighborhood_ids.includes(candidate.neighborhood_id)
  ) {
    return 12;
  }

  return 5; // neutral
}

function computeAcademicScore(
  seeker: RoommateProfile & RoommatePreference,
  candidate: RoommateProfile & RoommatePreference
): number {
  let score = 0;

  if (seeker.university_id && candidate.university_id && seeker.university_id === candidate.university_id) {
    score += 8;
  }

  if (seeker.campus_id && candidate.campus_id && seeker.campus_id === candidate.campus_id) {
    score += 4;
  }

  if (
    seeker.year_of_study &&
    candidate.year_of_study &&
    Math.abs(seeker.year_of_study - candidate.year_of_study) <= 1
  ) {
    score += 3;
  }

  return Math.min(score, 15);
}

function computeInterestScore(
  seeker: RoommateProfile & RoommatePreference,
  candidate: RoommateProfile & RoommatePreference
): number {
  const seekerInterests = new Set(seeker.interests);
  const candidateInterests = new Set(candidate.interests);

  let overlap = 0;
  for (const interest of candidateInterests) {
    if (seekerInterests.has(interest)) overlap++;
  }

  const total = seekerInterests.size + candidateInterests.size;
  if (total === 0) return 5;

  const jaccard = overlap / total;
  return Math.round(jaccard * 15);
}

function sumScores(subScores: MatchResult['subScores']): number {
  return Object.values(subScores).reduce((sum, val) => sum + (val || 0), 0);
}

// ---------------------------------------------------------------------------
// Friend Matching
// ---------------------------------------------------------------------------

export function computeFriendCompatibility(
  input: FriendCompatibilityInput
): MatchResult {
  const { seeker, candidate } = input;
  const reasons: string[] = [];
  const subScores: MatchResult['subScores'] = {};

  if (!friendHardFiltersPass(seeker, candidate)) {
    return { score: 0, reasons: ['Does not match your friend preferences'], subScores: {} };
  }

  const academicScore = computeFriendAcademicScore(seeker, candidate);
  subScores.academic = academicScore;
  if (academicScore >= 12) reasons.push('Similar academic background');
  else if (academicScore >= 6) reasons.push('Same university');

  const interestScore = computeFriendInterestScore(seeker, candidate);
  subScores.interests = interestScore;
  if (interestScore >= 12) reasons.push('Many shared interests');
  else if (interestScore >= 6) reasons.push('Some common interests');

  const socialScore = computeSocialScore(seeker, candidate);
  subScores.social = socialScore;
  if (socialScore >= 12) reasons.push('Compatible social styles');
  else if (socialScore >= 6) reasons.push('Some social overlap');

  const proximityScore = computeFriendProximityScore(seeker, candidate);
  subScores.proximity = proximityScore;
  if (proximityScore >= 15) reasons.push('Same campus');
  else if (proximityScore >= 8) reasons.push('Nearby');

  const total = sumScores(subScores);

  return {
    score: Math.min(total, 100),
    reasons: reasons.length > 0 ? reasons : ['Potential friend match'],
    subScores,
  };
}

function friendHardFiltersPass(
  seeker: FriendProfile & FriendPreference,
  candidate: FriendProfile & FriendPreference
): boolean {
  if (seeker.preferred_campus_id && candidate.campus_id !== seeker.preferred_campus_id) {
    return false;
  }

  return true;
}

function computeFriendAcademicScore(
  seeker: FriendProfile & FriendPreference,
  candidate: FriendProfile & FriendPreference
): number {
  let score = 0;

  if (seeker.university_id && candidate.university_id && seeker.university_id === candidate.university_id) {
    score += 8;
  }

  if (seeker.campus_id && candidate.campus_id && seeker.campus_id === candidate.campus_id) {
    score += 4;
  }

  if (
    seeker.year_of_study &&
    candidate.year_of_study &&
    Math.abs(seeker.year_of_study - candidate.year_of_study) <= 1
  ) {
    score += 3;
  }

  return Math.min(score, 15);
}

function computeFriendInterestScore(
  seeker: FriendProfile & FriendPreference,
  candidate: FriendProfile & FriendPreference
): number {
  const seekerInterests = new Set(seeker.interests);
  const candidateInterests = new Set(candidate.interests);

  let overlap = 0;
  for (const interest of candidateInterests) {
    if (seekerInterests.has(interest)) overlap++;
  }

  const total = seekerInterests.size + candidateInterests.size;
  if (total === 0) return 5;

  const jaccard = overlap / total;
  return Math.round(jaccard * 15);
}

function computeSocialScore(
  seeker: FriendProfile & FriendPreference,
  candidate: FriendProfile & FriendPreference
): number {
  if (seeker.personality_type && candidate.personality_type) {
    if (seeker.personality_type === candidate.personality_type) return 15;
    if (
      (seeker.personality_type === 'introvert' && candidate.personality_type === 'extrovert') ||
      (seeker.personality_type === 'extrovert' && candidate.personality_type === 'introvert')
    ) {
      return 8; // opposites can attract but less reliable
    }
  }
  return 8;
}

function computeFriendProximityScore(
  seeker: FriendProfile & FriendPreference,
  candidate: FriendProfile & FriendPreference
): number {
  if (seeker.campus_id && candidate.campus_id && seeker.campus_id === candidate.campus_id) {
    return 20;
  }
  return 5;
}
