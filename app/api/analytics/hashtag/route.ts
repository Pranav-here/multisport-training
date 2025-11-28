import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const VALID_EVENT_TYPES = [
  'hashtag_viewed',
  'challenge_opened',
  'upload_started',
  'upload_succeeded',
  'upload_failed',
  'submission_credited',
  'streak_incremented',
  'freeze_used',
  'leaderboard_viewed',
  'share_clicked',
  'example_viewed',
]

export async function POST(request: Request) {
  const supabase = await createServerClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  // Allow anonymous tracking but mark as such
  const userId = session?.user?.id || null

  try {
    const body = await request.json()
    const { event_type, hashtag_id, sport_id, clip_id, metadata } = body

    // Validate event type
    if (!event_type || !VALID_EVENT_TYPES.includes(event_type)) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'INVALID_EVENT_TYPE', message: 'Invalid or missing event_type' },
        },
        { status: 400 }
      )
    }

    type HashtagAnalyticsInsert = {
      user_id: string | null
      hashtag_id: string | null
      sport_id: string | null
      clip_id: string | null
      event_type: string
      metadata: Record<string, unknown>
      session_id: string | null
      device_type: string | null
    }

    const payload: HashtagAnalyticsInsert = {
      user_id: userId,
      hashtag_id: hashtag_id || null,
      sport_id: sport_id || null,
      clip_id: clip_id || null,
      event_type,
      metadata: metadata || {},
      session_id: metadata?.session_id || null,
      device_type: metadata?.device_type || null,
    }

    // Supabase types don't include this table yet, so cast to a lightweight interface to avoid a compile-time insert error
    type GenericSupabaseClient = {
      from: (table: string) => { insert: (values: HashtagAnalyticsInsert) => Promise<{ error: unknown }> }
    }

    const { error: insertError } = await (supabase as unknown as GenericSupabaseClient)
      .from('hashtag_analytics')
      .insert(payload)

    if (insertError) {
      console.error('[analytics/hashtag] insert error:', insertError)
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to record analytics event' },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data: { recorded: true }, error: null })
  } catch (error) {
    console.error('[analytics/hashtag] unexpected error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to record analytics event',
        },
      },
      { status: 500 }
    )
  }
}
