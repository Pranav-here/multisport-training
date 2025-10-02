import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import { respondError, respondOk } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { createServerClient } from '@/lib/supabase-server'

const paramsSchema = z.object({ id: z.string().uuid({ message: 'Invalid clip id' }) })
const postSchema = z.object({ body: z.string().min(1).max(300) })

const ACTION_WINDOW_MS = 1_000

export async function GET(request: Request, context: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as SupabaseClient<any>
  const parsed = paramsSchema.safeParse(context.params)

  if (!parsed.success) {
    return respondError('INVALID_PARAMS', 'Invalid clip id.', 400)
  }

  const clipId = parsed.data.id
  const { data: commentRows, error } = await supabase
    .from('clip_comments')
    .select('id, body, created_at, user_id')
    .eq('clip_id', clipId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[api/clips/comments] list', error)
    return respondError('DATABASE_ERROR', 'Unable to load comments.', 500)
  }

  const comments = commentRows ?? []
  const userIds = Array.from(new Set(comments.map((comment: { user_id: string }) => comment.user_id)))

  let profileRows: Array<{ id: string; display_name: string | null; username: string | null; avatar_url: string | null }> = []
  if (userIds.length) {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', userIds)

    if (profileError) {
      console.error('[api/clips/comments] profiles', profileError)
      return respondError('DATABASE_ERROR', 'Unable to load comments.', 500)
    }

    profileRows = data ?? []
  }

  const profileMap = new Map<string, { display_name: string | null; username: string | null; avatar_url: string | null }>()
  profileRows.forEach((row) => {
    profileMap.set(row.id, {
      display_name: row.display_name ?? null,
      username: row.username ?? null,
      avatar_url: row.avatar_url ?? null,
    })
  })

  return respondOk({
    comments: comments.map((comment: { id: string; body: string; created_at: string | null; user_id: string }) => {
      const profile = profileMap.get(comment.user_id)
      return {
        id: comment.id,
        body: comment.body,
        createdAt: comment.created_at,
        user: {
          id: comment.user_id,
          displayName: profile?.display_name ?? null,
          username: profile?.username ?? null,
          avatarUrl: profile?.avatar_url ?? null,
        },
      }
    }),
  })
}

export async function POST(request: Request, context: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as SupabaseClient<any>
  const { data: auth } = await supabase.auth.getSession()

  if (!auth.session) {
    return respondError('UNAUTHORIZED', 'Sign in required.', 401)
  }

  const params = paramsSchema.safeParse(context.params)
  if (!params.success) {
    return respondError('INVALID_PARAMS', 'Invalid clip id.', 400)
  }

  const body = await request.json().catch(() => null)
  const parsedBody = postSchema.safeParse(body)

  if (!parsedBody.success) {
    return respondError('INVALID_BODY', 'Comment body is required.', 400, {
      details: parsedBody.error.flatten(),
    })
  }

  const clipId = params.data.id
  const userId = auth.session.user.id
  const content = parsedBody.data.body.trim()

  if (!content) {
    return respondError('INVALID_BODY', 'Comment body is required.', 400)
  }

  const rateKey = `clip-comment:${userId}:${clipId}`
  const rate = checkRateLimit(rateKey, ACTION_WINDOW_MS)
  if (!rate.allowed) {
    return respondError('RATE_LIMITED', 'Too many comments. Please wait a moment.', 429, {
      details: { retryAfterMs: rate.retryAfterMs },
    })
  }

  const { data: insertData, error: insertError } = await supabase
    .from('clip_comments')
    .insert({ clip_id: clipId, user_id: userId, body: content })
    .select('id, body, created_at, user_id')
    .single()

  if (insertError || !insertData) {
    console.error('[api/clips/comments] insert', insertError)
    return respondError('DATABASE_ERROR', 'Unable to create comment.', 500)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, username, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.error('[api/clips/comments] profile', profileError)
    return respondError('DATABASE_ERROR', 'Unable to create comment.', 500)
  }

  return respondOk({
    comment: {
      id: insertData.id,
      body: insertData.body,
      createdAt: insertData.created_at,
      user: {
        id: insertData.user_id,
        displayName: profile?.display_name ?? null,
        username: profile?.username ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      },
    },
  }, { status: 201 })
}