export type AnalyticsPayload = Record<string, unknown>

export const track = (event: string, payload: AnalyticsPayload = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[analytics] ${event}`, payload)
  }
  // Wire to your analytics provider here.
  // Examples: Mixpanel, Amplitude, PostHog, Google Analytics, etc.
}

// ============================================================================
// DAILY CHALLENGE ANALYTICS EVENTS
// ============================================================================

/**
 * Track when a user views a daily challenge
 */
export const trackChallengeViewed = (payload: {
  challengeId: string
  sport: string
  difficulty: string
  points: number
  timeRemaining: number // seconds
}) => {
  track('challenge_viewed', {
    ...payload,
    category: 'daily_challenge',
  })
}

/**
 * Track when a user clicks "Join Challenge"
 */
export const trackChallengeJoined = (payload: {
  challengeId: string
  sport: string
  difficulty: string
  points: number
  source: 'dashboard' | 'detail_page' | 'notification'
}) => {
  track('challenge_joined', {
    ...payload,
    category: 'daily_challenge',
  })
}

/**
 * Track when a user starts recording/uploading for a challenge
 */
export const trackChallengeAttemptStarted = (payload: {
  challengeId: string
  sport: string
  difficulty: string
  attemptNumber: number
  method: 'upload' | 'record' | 'link'
}) => {
  track('challenge_attempt_started', {
    ...payload,
    category: 'daily_challenge',
  })
}

/**
 * Track when a user submits a challenge
 */
export const trackChallengeSubmitted = (payload: {
  challengeId: string
  sport: string
  difficulty: string
  attemptNumber: number
  method: 'upload' | 'record' | 'link'
  videoLength: number // seconds
  fileSize: number // bytes
}) => {
  track('challenge_submitted', {
    ...payload,
    category: 'daily_challenge',
  })
}

/**
 * Track when a challenge submission is verified
 */
export const trackChallengeVerified = (payload: {
  challengeId: string
  sport: string
  difficulty: string
  submissionId: string
  verificationMethod: 'auto' | 'manual' | 'ml' | 'hybrid'
  score: number
  passed: boolean
  timeToVerify: number // seconds from submission to verification
}) => {
  track('challenge_verified', {
    ...payload,
    category: 'daily_challenge',
  })
}

/**
 * Track when a challenge submission is scored
 */
export const trackChallengeScored = (payload: {
  challengeId: string
  sport: string
  difficulty: string
  submissionId: string
  score: number
  bonusPoints: number
  finalPoints: number
  scoreBreakdown: Record<string, number>
}) => {
  track('challenge_scored', {
    ...payload,
    category: 'daily_challenge',
  })
}

/**
 * Track when a user earns a badge
 */
export const trackBadgeEarned = (payload: {
  badgeId: string
  badgeCode: string
  badgeName: string
  rarity: string
  challengeId?: string
  trigger: 'streak' | 'score' | 'variety' | 'special'
}) => {
  track('badge_earned', {
    ...payload,
    category: 'achievements',
  })
}

/**
 * Track when a user's streak is incremented
 */
export const trackStreakIncremented = (payload: {
  challengeId: string
  currentStreak: number
  previousStreak: number
  isNewRecord: boolean
}) => {
  track('streak_incremented', {
    ...payload,
    category: 'achievements',
  })
}

/**
 * Track when a user's streak is broken
 */
export const trackStreakBroken = (payload: {
  previousStreak: number
  daysMissed: number
  lastChallengeDate: string
}) => {
  track('streak_broken', {
    ...payload,
    category: 'achievements',
  })
}

/**
 * Track when a user sets a reminder
 */
export const trackReminderSet = (payload: {
  challengeId: string
  reminderType: 'snooze' | 'daily' | 'time_based'
  remindAt: string
  hoursFromNow: number
}) => {
  track('reminder_set', {
    ...payload,
    category: 'engagement',
  })
}

/**
 * Track when a user views the challenge leaderboard
 */
export const trackLeaderboardViewed = (payload: {
  challengeId: string
  leaderboardType: 'global' | 'school' | 'friends' | 'local'
  userRank?: number
}) => {
  track('leaderboard_viewed', {
    ...payload,
    category: 'social',
  })
}

/**
 * Track challenge completion rate drop-off
 */
export const trackChallengeFunnel = (payload: {
  challengeId: string
  sport: string
  difficulty: string
  step: 'viewed' | 'joined' | 'started' | 'submitted' | 'verified'
  timeOnStep: number // seconds
}) => {
  track('challenge_funnel', {
    ...payload,
    category: 'conversion',
  })
}

/**
 * Track when a challenge expires without completion
 */
export const trackChallengeMissed = (payload: {
  challengeId: string
  sport: string
  difficulty: string
  points: number
  wasJoined: boolean
  wasStarted: boolean
}) => {
  track('challenge_missed', {
    ...payload,
    category: 'engagement',
  })
}
