import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { logger } from '@/lib/log'

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

interface BatchEvent {
  event_type: string
  hashtag_id?: string
  sport_id?: number
  clip_id?: string
  metadata?: Record<string, unknown>
}

export async function POST(request: Request) {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Allow anonymous tracking but mark as such
  const userId = session?.user?.id || null

  try {
    const body = await request.json()
    const { events } = body as { events?: BatchEvent[] }

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'INVALID_PAYLOAD', message: 'Events array is required and must not be empty' },
        },
        { status: 400 }
      )
    }

    // Validate all events
    const invalidEvents = events.filter(
      (event) => !event.event_type || !VALID_EVENT_TYPES.includes(event.event_type)
    )

    if (invalidEvents.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_EVENT_TYPES',
            message: `${invalidEvents.length} event(s) have invalid event_type`,
          },
        },
        { status: 400 }
      )
    }

    // Transform events for batch insert
    const analyticsRecords = events.map((event) => ({
      user_id: userId,
      hashtag_id: event.hashtag_id || null,
      sport_id: event.sport_id || null,
      clip_id: event.clip_id || null,
      event_type: event.event_type,
      metadata: event.metadata || {},
      session_id: event.metadata?.session_id || null,
      device_type: event.metadata?.device_type || null,
    }))

    // Batch insert analytics events
    // NOTE: When connecting to Supabase later, uncomment this section
    /*
    const { error: insertError } = await supabase
      .from('hashtag_analytics')
      .insert(analyticsRecords)

    if (insertError) {
      logger.error(
        { error: insertError.message, eventsCount: events.length },
        '[analytics/hashtag/batch] Batch insert failed'
      )
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'DATABASE_ERROR', message: 'Failed to record batch analytics events' },
        },
        { status: 500 }
      )
    }
    */

    // For now, just log the events (mock mode)
    logger.info(
      { eventsCount: events.length, userId },
      '[analytics/hashtag/batch] Batch analytics events recorded (mock mode)'
    )

    return NextResponse.json({
      ok: true,
      data: { recorded: events.length, userId: userId || 'anonymous' },
      error: null,
    })
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      '[analytics/hashtag/batch] Unexpected error'
    )
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to record batch analytics events',
        },
      },
      { status: 500 }
    )
  }
}
