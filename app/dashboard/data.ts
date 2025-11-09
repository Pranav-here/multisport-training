import { cache } from "react";
import { createServerClient } from "@/lib/supabase-server";
import { logger } from "@/lib/log";

/**
 * Server-side data fetching for dashboard with React cache
 * These functions are cached per-request to avoid duplicate queries
 */

export interface DashboardClip {
  id: string;
  userId: string;
  caption: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  sport: {
    id: number | null;
    slug: string;
    name: string;
  } | null;
  hashtag: {
    id: string;
    name: string;
  } | null;
  metrics: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    likedByUser: boolean;
  };
  user: {
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  school: string;
  sport: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  todayCompleted: boolean;
}

/**
 * Fetch user's clips for the feed
 * Cached per-request to avoid duplicate queries
 */
export const fetchDashboardClips = cache(async (userId?: string): Promise<DashboardClip[]> => {
  const startTime = Date.now();

  try {
    const supabase = await createServerClient();

    const { data: clips, error } = await supabase
      .from("clips")
      .select(`
        id,
        user_id,
        caption,
        video_url,
        thumbnail_url,
        sport:sports(id, slug, name),
        hashtag:hashtags(id, name),
        created_at,
        user:users!clips_user_id_fkey(display_name, username, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      logger.error({ error: error.message, duration: Date.now() - startTime }, "Failed to fetch dashboard clips");
      return [];
    }

    if (!clips) {
      return [];
    }

    // Fetch like counts and user likes in parallel
    const clipsWithMetrics: DashboardClip[] = await Promise.all(
      clips.map(async (clip) => {
        const [likesResult, userLikeResult] = userId
          ? await Promise.all([
              supabase.from("clip_likes").select("id", { count: "exact", head: true }).eq("clip_id", clip.id),
              supabase
                .from("clip_likes")
                .select("id")
                .eq("clip_id", clip.id)
                .eq("user_id", userId)
                .maybeSingle(),
            ])
          : [
              await supabase.from("clip_likes").select("id", { count: "exact", head: true }).eq("clip_id", clip.id),
              { data: null },
            ];

        return {
          id: clip.id,
          userId: clip.user_id,
          caption: clip.caption,
          videoUrl: clip.video_url,
          thumbnailUrl: clip.thumbnail_url,
          sport: clip.sport as DashboardClip["sport"],
          hashtag: clip.hashtag as DashboardClip["hashtag"],
          metrics: {
            likesCount: likesResult.count ?? 0,
            commentsCount: 0, // TODO: Implement comments count
            sharesCount: 0, // TODO: Implement shares count
            likedByUser: !!userLikeResult.data,
          },
          user: {
            displayName: (clip.user as any)?.display_name ?? null,
            username: (clip.user as any)?.username ?? null,
            avatarUrl: (clip.user as any)?.avatar_url ?? null,
          },
          createdAt: clip.created_at,
        };
      })
    );

    logger.info(
      { clipsCount: clipsWithMetrics.length, duration: Date.now() - startTime },
      "Fetched dashboard clips"
    );

    return clipsWithMetrics;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), duration: Date.now() - startTime },
      "Unexpected error fetching dashboard clips"
    );
    return [];
  }
});

/**
 * Fetch leaderboard data
 * Cached per-request
 */
export const fetchLeaderboard = cache(async (): Promise<LeaderboardEntry[]> => {
  const startTime = Date.now();

  try {
    const supabase = await createServerClient();

    const { data: leaderboard, error } = await supabase
      .from("leaderboard")
      .select(`
        user_id,
        score,
        sport:sports(id, slug, name),
        user:users!leaderboard_user_id_fkey(display_name, username, avatar_url)
      `)
      .order("score", { ascending: false })
      .limit(10);

    if (error) {
      logger.error({ error: error.message, duration: Date.now() - startTime }, "Failed to fetch leaderboard");
      return [];
    }

    if (!leaderboard) {
      return [];
    }

    const mapped: LeaderboardEntry[] = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user_id,
      userName: (entry.user as any)?.display_name ?? (entry.user as any)?.username ?? "Athlete",
      userAvatar: (entry.user as any)?.avatar_url ?? "/placeholder.svg",
      score: entry.score ?? 0,
      school: (entry.user as any)?.username ? `@${(entry.user as any).username}` : "",
      sport: (entry.sport as any)?.name ?? "Multi-Sport",
    }));

    logger.info({ entriesCount: mapped.length, duration: Date.now() - startTime }, "Fetched leaderboard");

    return mapped;
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), duration: Date.now() - startTime },
      "Unexpected error fetching leaderboard"
    );
    return [];
  }
});

/**
 * Fetch user's streak data
 * Cached per-request
 */
export const fetchUserStreak = cache(async (userId: string): Promise<StreakData> => {
  const startTime = Date.now();
  const defaultStreak: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    weeklyGoal: 7,
    weeklyProgress: 0,
    todayCompleted: false,
  };

  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("streaks")
      .select("current_streak, longest_streak, last_activity_date")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.error({ error: error.message, userId, duration: Date.now() - startTime }, "Failed to fetch user streak");
      return defaultStreak;
    }

    if (!data) {
      return defaultStreak;
    }

    const today = new Date().toISOString().slice(0, 10);
    const streak: StreakData = {
      currentStreak: data.current_streak ?? 0,
      longestStreak: data.longest_streak ?? 0,
      weeklyGoal: 7,
      weeklyProgress: Math.min(data.current_streak ?? 0, 7),
      todayCompleted: data.last_activity_date === today,
    };

    logger.info({ userId, streak, duration: Date.now() - startTime }, "Fetched user streak");

    return streak;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        userId,
        duration: Date.now() - startTime,
      },
      "Unexpected error fetching user streak"
    );
    return defaultStreak;
  }
});

/**
 * Fetch all dashboard data in parallel
 * This is the main function to use in the dashboard page
 */
export async function fetchDashboardData(userId?: string) {
  const [clips, leaderboard, streak] = await Promise.all([
    fetchDashboardClips(userId),
    fetchLeaderboard(),
    userId ? fetchUserStreak(userId) : Promise.resolve(null),
  ]);

  return {
    clips,
    leaderboard,
    streak,
  };
}
