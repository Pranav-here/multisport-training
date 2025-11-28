import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createServerClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json(
      { ok: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  try {
    // Get all sport streaks for user (including all-sport combo)
    const { data: streaks, error: streaksError } = await supabase
      .from('sport_streaks')
      .select('*, sports(id, slug, name)')
      .eq('user_id', session.user.id)

    if (streaksError) {
      console.error('[streaks] database error', streaksError)
      return NextResponse.json(
        { ok: false, data: null, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch streaks' } },
        { status: 500 }
      )
    }

    // Get available freezes
    const { data: freezes, error: freezesError } = await supabase
      .from('streak_freezes')
      .select('*, sport_streaks(sport_id, sports(slug, name))')
      .eq('user_id', session.user.id)
      .eq('status', 'available')

    if (freezesError) {
      console.error('[streaks] freezes error', freezesError)
    }

    const today = new Date().toISOString().split('T')[0]

    const formattedStreaks = (streaks || []).map((s) => ({
      id: s.id,
      sportId: s.sport_id,
      sportSlug: s.sports?.slug || null,
      sportName: s.sports?.name || 'All Sports',
      currentStreak: s.current_streak,
      bestStreak: s.best_streak,
      lastActivityDate: s.last_activity_date,
      weeklyGoal: s.weekly_goal,
      weeklyProgress: s.weekly_progress,
      activityCalendar: s.activity_calendar || [],
      totalDaysActive: s.total_days_active,
      todayCompleted: s.last_activity_date === today,
    }))

    // Find all-sport streak
    const allSportStreak = formattedStreaks.find((s) => s.sportId === null)

    // Find per-sport streaks
    const sportStreaks = formattedStreaks.filter((s) => s.sportId !== null)

    const formattedFreezes = (freezes || []).map((f) => ({
      id: f.id,
      freezeType: f.freeze_type,
      earnedByStreakDays: f.earned_by_streak_days,
      purchasedWithCoins: f.purchased_with_coins,
      status: f.status,
      expiresAt: f.expires_at,
      autoApply: f.auto_apply,
      earnedAt: f.earned_at,
      sportSlug: f.sport_streaks?.sports?.slug || null,
      sportName: f.sport_streaks?.sports?.name || 'All Sports',
    }))

    return NextResponse.json({
      ok: true,
      data: {
        allSportStreak: allSportStreak || {
          id: null,
          sportId: null,
          sportSlug: null,
          sportName: 'All Sports',
          currentStreak: 0,
          bestStreak: 0,
          lastActivityDate: null,
          weeklyGoal: 7,
          weeklyProgress: 0,
          activityCalendar: [],
          totalDaysActive: 0,
          todayCompleted: false,
        },
        sportStreaks,
        freezes: formattedFreezes,
      },
      error: null,
    })
  } catch (error) {
    console.error('[streaks] unexpected error', error)
    return NextResponse.json(
      {
        ok: false,
        data: null,
        error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Failed to fetch streaks' },
      },
      { status: 500 }
    )
  }
}
