import type {
  FriendProfile,
  FriendPreference,
  RoommateProfile,
  RoommatePreference,
  MatchResult,
} from '@/types'
import { computeFriendCompatibility, computeRoommateCompatibility } from '@/services/matching-algorithm'

export type CompatibilityType = 'general' | 'social' | 'scholarly' | 'roommate'

export interface CompatibilityScores {
  general: number
  social: number
  scholarly: number
  roommate: number
}

export interface CompatibilityResult {
  type: CompatibilityType
  score: number
  reasons: string[]
  subScores?: MatchResult['subScores']
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function mergeScores(...scores: (number | null | undefined)[]): number {
  const valid = scores.filter((s): s is number => s !== null && s !== undefined)
  if (valid.length === 0) return 0
  return valid.reduce((sum, s) => sum + s, 0) / valid.length
}

export function computeAllCompatibilities(
  seekerFriend: (FriendProfile & FriendPreference) | null,
  candidateFriend: (FriendProfile & FriendPreference) | null,
  seekerRoommate: (RoommateProfile & RoommatePreference) | null,
  candidateRoommate: (RoommateProfile & RoommatePreference) | null,
): CompatibilityScores {
  let friendResult: MatchResult | null = null
  let roommateResult: MatchResult | null = null

  if (seekerFriend && candidateFriend) {
    friendResult = computeFriendCompatibility({ seeker: seekerFriend, candidate: candidateFriend })
  }

  if (seekerRoommate && candidateRoommate) {
    roommateResult = computeRoommateCompatibility({ seeker: seekerRoommate, candidate: candidateRoommate })
  }

  const academicScore = friendResult?.subScores?.academic ?? roommateResult?.subScores?.academic ?? null
  const interestScore = friendResult?.subScores?.interests ?? roommateResult?.subScores?.interests ?? null
  const socialScore = friendResult?.subScores?.social ?? null
  const budgetScore = roommateResult?.subScores?.budget ?? null
  const lifestyleScore = roommateResult?.subScores?.lifestyle ?? null
  const locationScore = roommateResult?.subScores?.location ?? null

  const social = clampScore(mergeScores(socialScore, interestScore))
  const scholarly = clampScore(mergeScores(academicScore))
  const roommate = roommateResult ? clampScore(roommateResult.score) : clampScore(mergeScores(budgetScore, lifestyleScore, locationScore, academicScore, interestScore) * (100 / 85))

  const general = clampScore(mergeScores(social, scholarly, roommate))

  return { general, social, scholarly, roommate }
}

export function getCompatibilityResult(
  type: CompatibilityType,
  seekerFriend: (FriendProfile & FriendPreference) | null,
  candidateFriend: (FriendProfile & FriendPreference) | null,
  seekerRoommate: (RoommateProfile & RoommatePreference) | null,
  candidateRoommate: (RoommateProfile & RoommatePreference) | null,
): CompatibilityResult {
  const scores = computeAllCompatibilities(seekerFriend, candidateFriend, seekerRoommate, candidateRoommate)
  const score = scores[type]

  const reasons: string[] = []
  if (seekerFriend && candidateFriend) {
    const friendResult = computeFriendCompatibility({ seeker: seekerFriend, candidate: candidateFriend })
    reasons.push(...friendResult.reasons.slice(0, 2))
  }
  if (seekerRoommate && candidateRoommate) {
    const roommateResult = computeRoommateCompatibility({ seeker: seekerRoommate, candidate: candidateRoommate })
    reasons.push(...roommateResult.reasons.slice(0, 2))
  }

  const uniqueReasons = Array.from(new Set(reasons))
  if (uniqueReasons.length === 0) {
    uniqueReasons.push('Same institution')
  }

  return {
    type,
    score,
    reasons: uniqueReasons.slice(0, 3),
    subScores: seekerFriend && candidateFriend
      ? computeFriendCompatibility({ seeker: seekerFriend, candidate: candidateFriend }).subScores
      : seekerRoommate && candidateRoommate
        ? computeRoommateCompatibility({ seeker: seekerRoommate, candidate: candidateRoommate }).subScores
        : undefined,
  }
}
