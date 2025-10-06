import { z } from 'zod'

import { respondError, respondOk } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { createServerClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

const paramsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid clip id' }),
})

const ACTION_WINDOW_MS = 1_000

type ClipLikeRouteContext = { readonly params: Promise<{ readonly id: string }> }

type ClipLikeInsert = Database['public']['Tables']['clip_likes']['Insert']

type ClipLikesClient = {
  from(table: 'clip_likes'): {
    insert(values: ClipLikeInsert): Promise<{ error: unknown }>
  }
}

export async function POST(request: Request, { params }: ClipLikeRouteContext) {
  const supabase = createServerClient()
  const { data: auth } = await supabase.auth.getSession()

  if (!auth.session) {
    return respondError('UNAUTHORIZED', 'Sign in required.', 401)
  }

  const routeParams = await params
  const parsed = paramsSchema.safeParse(routeParams)
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
    const clipLikesClient = supabase as unknown as ClipLikesClient
    const { error: insertError } = await clipLikesClient
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