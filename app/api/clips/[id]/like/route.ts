import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import { respondError, respondOk } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { createServerClient } from '@/lib/supabase-server'

const paramsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid clip id' }),
})

const ACTION_WINDOW_MS = 1_000

export async function POST(request: Request, context: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as SupabaseClient<any>
  const { data: auth } = await supabase.auth.getSession()

  if (!auth.session) {
    return respondError('UNAUTHORIZED', 'Sign in required.', 401)
  }

  const parsed = paramsSchema.safeParse(context.params)
  if (!parsed.success) {
    return respondError('INVALID_PARAMS', 'Invalid clip id.', 400)
  }

  const clipId = parsed.data.id
  const userId = auth.session.user.id

  const rateKey = `clip-like:${userId}:${clipId}`
  const rate = checkRateLimit(rateKey, ACTION_WINDOW_MS)
  if (!rate.allowed) {
    return respondError('RATE_LIMITED', 'Too many like actions. Please wait a moment.', 429, {
      details: { retryAfterMs: rate.retryAfterMs },
    })
  }

  const { data: existing, error: existingError } = await supabase
    .from('clip_likes')
    .select('user_id')
    .eq('clip_id', clipId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError) {
    console.error('[api/clips/like] select existing', existingError)
    return respondError('DATABASE_ERROR', 'Unable to toggle like right now.', 500)
  }

  let liked = false

  if (existing) {
    const { error: deleteError } = await supabase
      .from('clip_likes')
      .delete()
      .eq('clip_id', clipId)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('[api/clips/like] delete', deleteError)
      return respondError('DATABASE_ERROR', 'Unable to toggle like right now.', 500)
    }
  } else {
    const { error: insertError } = await supabase
      .from('clip_likes')
      .insert({ clip_id: clipId, user_id: userId })

    if (insertError) {
      console.error('[api/clips/like] insert', insertError)
      return respondError('DATABASE_ERROR', 'Unable to toggle like right now.', 500)
    }

    liked = true
  }

  const { count, error: countError } = await supabase
    .from('clip_likes')
    .select('clip_id', { count: 'exact', head: true })
    .eq('clip_id', clipId)

  if (countError) {
    console.error('[api/clips/like] count', countError)
    return respondError('DATABASE_ERROR', 'Unable to fetch like count.', 500)
  }

  return respondOk({ liked, count: count ?? 0 })
}