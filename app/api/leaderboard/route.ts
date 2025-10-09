import type { SupabaseClient } from '@supabase/supabase-js'

import { respondError, respondOk } from '@/lib/api-response'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as unknown as SupabaseClient<any>
  const url = new URL(request.url)
  const sportSlug = url.searchParams.get('sportSlug')

  let sportFilter: number | null = null
  if (sportSlug) {
    const { data: sportRow, error: sportError } = await supabase.from('sports').select('id').eq('slug', sportSlug).maybeSingle()
    if (sportError) {
      console.error('[api/leaderboard] sport lookup', sportError)
      return respondError('DATABASE_ERROR', 'Unable to load leaderboard.', 500)
    }
    if (!sportRow) {
      return respondOk({ leaderboard: [] })
    }
    sportFilter = sportRow.id
  }

  let query = supabase
    .from('leaderboard_7d')
    .select('sport_id, user_id, score')
    .order('score', { ascending: false })
    .limit(20)

  if (sportFilter) {
    query = query.eq('sport_id', sportFilter)
  }

  const { data: rows, error } = await query

  if (error) {
    console.error('[api/leaderboard] list', error)
    return respondError('DATABASE_ERROR', 'Unable to load leaderboard.', 500)
  }

  const leaderboardRows = rows ?? []
  const userIds = Array.from(new Set(leaderboardRows.map((row: { user_id: string }) => row.user_id)))
  const sportIds = Array.from(new Set(leaderboardRows.map((row: { sport_id: number | null }) => row.sport_id).filter((id): id is number => typeof id === 'number')))

  let profileRows: Array<{ id: string; display_name: string | null; username: string | null; avatar_url: string | null }> = []
  if (userIds.length) {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', userIds)

    if (profileError) {
      console.error('[api/leaderboard] profiles', profileError)
      return respondError('DATABASE_ERROR', 'Unable to load leaderboard.', 500)
    }

    profileRows = data ?? []
  }

  let sportRows: Array<{ id: number; slug: string | null; name: string | null }> = []
  if (sportIds.length) {
    const { data, error: sportLookupError } = await supabase
      .from('sports')
      .select('id, slug, name')
      .in('id', sportIds)

    if (sportLookupError) {
      console.error('[api/leaderboard] sports detail', sportLookupError)
      return respondError('DATABASE_ERROR', 'Unable to load leaderboard.', 500)
    }

    sportRows = data ?? []
  }

  const profileMap = new Map(profileRows.map((row) => [row.id, row]))
  const sportMap = new Map(sportRows.map((row) => [row.id, row]))

  const leaderboard = leaderboardRows.map((row: { user_id: string; sport_id: number | null; score: number | null }) => {
    const profile = profileMap.get(row.user_id)
    const sport = row.sport_id ? sportMap.get(row.sport_id) : null

    return {
      userId: row.user_id,
      score: row.score,
      sport: sport
        ? {
            id: row.sport_id,
            slug: sport.slug ?? null,
            name: sport.name ?? null,
          }
        : null,
      user: {
        displayName: profile?.display_name ?? null,
        username: profile?.username ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      },
    }
  })

  return respondOk({ leaderboard })
}
