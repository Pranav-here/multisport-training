import { z } from "zod";

/**
 * Validation schemas for API inputs and outputs
 * Using Zod for runtime type safety and validation
 */

// ============================================================================
// Challenge Schemas
// ============================================================================

export const challengeSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  sport: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  points: z.number().int().positive(),
  videoUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  createdAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  completions: z.number().int().nonnegative().default(0),
});

export type Challenge = z.infer<typeof challengeSchema>;

export const dailyChallengeResponseSchema = z.object({
  challenge: challengeSchema,
  userProgress: z
    .object({
      completed: z.boolean(),
      completedAt: z.string().datetime().optional(),
      score: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

// ============================================================================
// Hashtag Schemas
// ============================================================================

export const hashtagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  sport: z.string(),
  clipCount: z.number().int().nonnegative().default(0),
  participantCount: z.number().int().nonnegative().default(0),
  totalViews: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime().optional(),
  trending: z.boolean().default(false),
});

export type Hashtag = z.infer<typeof hashtagSchema>;

export const hashtagStatsSchema = z.object({
  totalClips: z.number().int().nonnegative(),
  totalParticipants: z.number().int().nonnegative(),
  totalViews: z.number().int().nonnegative(),
  totalLikes: z.number().int().nonnegative(),
  avgEngagement: z.number().nonnegative(),
  topContributors: z
    .array(
      z.object({
        userId: z.string(),
        username: z.string(),
        clipCount: z.number().int().nonnegative(),
      })
    )
    .optional(),
});

export type HashtagStats = z.infer<typeof hashtagStatsSchema>;

// ============================================================================
// Clip Schemas
// ============================================================================

export const clipSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  hashtagId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  sport: z.string(),
  duration: z.number().positive().optional(),
  likes: z.number().int().nonnegative().default(0),
  views: z.number().int().nonnegative().default(0),
  comments: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Clip = z.infer<typeof clipSchema>;

// ============================================================================
// Athlete Search Schemas (TheSportsDB)
// ============================================================================

export const athleteSearchResultSchema = z.object({
  idPlayer: z.string(),
  strPlayer: z.string(),
  strTeam: z.string().nullable(),
  strNationality: z.string().nullable().optional(),
  strSport: z.string().nullable().optional(),
  strPosition: z.string().nullable().optional(),
  strThumb: z.string().nullable().optional(),
});

export const athleteSearchResponseSchema = z.object({
  player: z.array(athleteSearchResultSchema).nullable(),
});

export type AthleteSearchResult = z.infer<typeof athleteSearchResultSchema>;

// Normalized athlete response for our API
export const normalizedAthleteSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.string(),
  nationality: z.string().optional(),
  sport: z.string().optional(),
  position: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type NormalizedAthlete = z.infer<typeof normalizedAthleteSchema>;

// ============================================================================
// User & Profile Schemas
// ============================================================================

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  sportPreferences: z.array(z.string()).default([]),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  points: z.number().int().nonnegative().default(0),
  streak: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// ============================================================================
// Streak Schemas
// ============================================================================

export const streakSchema = z.object({
  userId: z.string().uuid(),
  hashtagId: z.string().uuid(),
  currentStreak: z.number().int().nonnegative().default(0),
  longestStreak: z.number().int().nonnegative().default(0),
  lastPostDate: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export type Streak = z.infer<typeof streakSchema>;

// ============================================================================
// API Request/Response Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative().optional(),
});

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  statusCode: z.number().int().optional(),
});

export const apiSuccessSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  message: z.string().optional(),
});

// ============================================================================
// Upload Schemas
// ============================================================================

export const uploadUrlRequestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().regex(/^(video|image)\//),
  fileSize: z.number().int().positive().max(100 * 1024 * 1024), // 100MB max
});

export const uploadUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  publicUrl: z.string().url(),
  expiresIn: z.number().int().positive(),
});

// ============================================================================
// Leaderboard Schemas
// ============================================================================

export const leaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  userId: z.string().uuid(),
  username: z.string(),
  avatarUrl: z.string().url().optional(),
  score: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative().optional(),
  change: z.number().int().optional(), // Position change from previous period
});

export const leaderboardSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly", "allTime"]),
  sport: z.string().optional(),
  entries: z.array(leaderboardEntrySchema),
  lastUpdated: z.string().datetime(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type Leaderboard = z.infer<typeof leaderboardSchema>;
