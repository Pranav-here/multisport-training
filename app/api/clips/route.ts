import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import { respondError, respondOk } from '@/lib/api-response'
import { createServerClient } from '@/lib/supabase-server'

type ClipRow = {
  id: string
  user_id: string
  sport_id: number | null
  storage_path: string
  thumbnail_url: string | null
  caption: string | null
  visibility: string
  duration_seconds: number | null
  width: number | null
  height: number | null
  created_at: string
}

type ClipResponse = {
  id: string
  userId: string
  storagePath: string
  caption: string | null
  thumbnailUrl: string | null
  visibility: string
  createdAt: string
  durationSeconds: number | null
  width: number | null
  height: number | null
  sport: { id: number | null; slug: string | null; name: string | null } | null
  user: {
    id: string
    displayName: string | null
    username: string | null
    avatarUrl: string | null
  }
  metrics: { likesCount: number; likedByUser: boolean; commentsCount: number }
}

const postSchema = z.object({
  sportSlug: z.string().min(1),
  storagePath: z.string().min(1),
  caption: z.string().max(500).optional(),
  visibility: z.enum(['public', 'followers', 'private']).default('public'),
  thumbnailUrl: z.string().max(500).optional(),
  durationSeconds: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

const STORAGE_PATH_PATTERN = /^user\/([a-f0-9-]{36})\/.+/

function ensureStoragePathMatchesUser(path: string, userId: string) {
  if (!STORAGE_PATH_PATTERN.test(path)) {
    return false
  }

  return path.startsWith(`user/${userId}/`)
}

async function hydrateClips({
  clips,
  supabase,
  currentUserId,
}: {
  clips: ClipRow[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>;
  currentUserId?: string;
}): Promise<ClipResponse[]> {
  if (!clips.length) {
    return []
  }

  const userIds = Array.from(new Set(clips.map((clip) => clip.user_id)))
  const sportIds = Array.from(
    new Set(clips.map((clip) => clip.sport_id).filter((value): value is number => typeof value === 'number'))
  )
  const clipIds = clips.map((clip) => clip.id)

  const { data: profileRows, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .in('id', userIds)

  if (profileError) {
    console.error('[api/clips] profile lookup', profileError)
    return []
  }

  const profilesMap = new Map<string, { display_name: string | null; username: string | null; avatar_url: string | null }>()
  for (const row of (profileRows ?? []) as Array<{ id: string; display_name: string | null; username: string | null; avatar_url: string | null }>) {
    profilesMap.set(row.id, {
      display_name: row.display_name ?? null,
      username: row.username ?? null,
      avatar_url: row.avatar_url ?? null,
    })
  }

  let sportRows: Array<{ id: number; slug: string | null; name: string | null }> = []
  if (sportIds.length) {
    const { data, error } = await supabase.from('sports').select('id, slug, name').in('id', sportIds)
    if (error) {
      console.error('[api/clips] sport lookup', error)
    }
    sportRows = data ?? []
  }

  const sportsMap = new Map<number, { slug: string | null; name: string | null }>()
  sportRows.forEach((row) => {
    sportsMap.set(row.id, { slug: row.slug ?? null, name: row.name ?? null })
  })

  let likeRows: Array<{ clip_id: string; user_id: string }> = []
  if (clipIds.length) {
    const { data, error } = await supabase.from('clip_likes').select('clip_id, user_id').in('clip_id', clipIds)
    if (error) {
      console.error('[api/clips] like lookup', error)
    }
    likeRows = data ?? []
  }

  const likeCounts = new Map<string, { count: number; liked: boolean }>()
  likeRows.forEach((row) => {
    const entry = likeCounts.get(row.clip_id) ?? { count: 0, liked: false }
    entry.count += 1
    if (currentUserId && row.user_id === currentUserId) {
      entry.liked = true
    }
    likeCounts.set(row.clip_id, entry)
  })

  let commentRows: Array<{ clip_id: string }> = []
  if (clipIds.length) {
    const { data, error } = await supabase.from('clip_comments').select('clip_id').in('clip_id', clipIds)
    if (error) {
      console.error('[api/clips] comment lookup', error)
    }
    commentRows = data ?? []
  }

  const commentCounts = new Map<string, number>()
  commentRows.forEach((row) => {
    commentCounts.set(row.clip_id, (commentCounts.get(row.clip_id) ?? 0) + 1)
  })

  return clips.map((clip) => {
    const profile = profilesMap.get(clip.user_id)
    const sport = clip.sport_id ? sportsMap.get(clip.sport_id) ?? null : null
    const likeData = likeCounts.get(clip.id) ?? { count: 0, liked: false }

    return {
      id: clip.id,
      userId: clip.user_id,
      storagePath: clip.storage_path,
      caption: clip.caption ?? null,
      thumbnailUrl: clip.thumbnail_url ?? null,
      visibility: clip.visibility,
      createdAt: clip.created_at,
      durationSeconds: clip.duration_seconds,
      width: clip.width,
      height: clip.height,
      sport: sport
        ? {
            id: clip.sport_id,
            slug: sport.slug,
            name: sport.name,
          }
        : null,
      user: {
        id: clip.user_id,
        displayName: profile?.display_name ?? null,
        username: profile?.username ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      },
      metrics: {
        likesCount: likeData.count,
        likedByUser: likeData.liked,
        commentsCount: commentCounts.get(clip.id) ?? 0,
      },
    }
  })
}

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as SupabaseClient<any>
  const { data: auth } = await supabase.auth.getSession()

  if (!auth.session) {
    return respondError('UNAUTHORIZED', 'Sign in required.', 401)
  }

  const body = await request.json().catch(() => null)
  const parsed = postSchema.safeParse(body)

  if (!parsed.success) {
    return respondError('INVALID_BODY', 'Invalid request payload.', 400, {
      details: parsed.error.flatten(),
    })
  }

  const { sportSlug, storagePath, caption, visibility, thumbnailUrl, durationSeconds, width, height } = parsed.data
  const userId = auth.session.user.id

  if (!ensureStoragePathMatchesUser(storagePath, userId)) {
    return respondError('INVALID_BODY', 'Storage path must follow user/<auth_uid>/<filename>.', 400)
  }

  const { data: sportRow, error: sportError } = await supabase
    .from('sports')
    .select('id')
    .eq('slug', sportSlug)
    .maybeSingle()

  if (sportError) {
    console.error('[api/clips] sport lookup', sportError)
    return respondError('DATABASE_ERROR', 'Unable to resolve sport.', 500)
  }

  if (!sportRow) {
    return respondError('NOT_FOUND', 'Sport not found.', 404)
  }

  const insertPayload = {
    user_id: userId,
    sport_id: sportRow.id,
    storage_path: storagePath,
    caption: caption ?? null,
    visibility,
    thumbnail_url: thumbnailUrl ?? null,
    duration_seconds: durationSeconds ?? null,
    width: width ?? null,
    height: height ?? null,
  }

  const { data: insertData, error: insertError } = await supabase
    .from('clips')
    .insert(insertPayload)
    .select('id, user_id, sport_id, storage_path, thumbnail_url, caption, visibility, duration_seconds, width, height, created_at')
    .single()

  if (insertError || !insertData) {
    console.error('[api/clips] insert', insertError)
    return respondError('DATABASE_ERROR', 'Unable to create clip.', 500)
  }

  try {
    await supabase.rpc('increment_streak', { p_user: userId })
  } catch (rpcError) {
    console.error('[api/clips] increment_streak', rpcError)
  }

  const [clip] = await hydrateClips({ clips: [insertData], supabase, currentUserId: userId })

  return respondOk({ clip }, { status: 201 })
}

export async function GET(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as SupabaseClient<any>
  const { data: auth } = await supabase.auth.getSession()
  const url = new URL(request.url)
  const sportSlug = url.searchParams.get('sportSlug')
  const userParam = url.searchParams.get('user')

  let sportFilter: number | null = null
  if (sportSlug) {
    const { data: sportRow, error: sportLookupError } = await supabase.from('sports').select('id').eq('slug', sportSlug).maybeSingle()
    if (sportLookupError) {
      console.error('[api/clips] sport filter', sportLookupError)
      return respondError('DATABASE_ERROR', 'Unable to load clips.', 500)
    }
    sportFilter = sportRow?.id ?? null
    if (sportSlug && !sportFilter) {
      return respondOk({ clips: [] })
    }
  }

  let query = supabase
    .from('clips')
    .select('id, user_id, sport_id, storage_path, thumbnail_url, caption, visibility, duration_seconds, width, height, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (sportFilter) {
    query = query.eq('sport_id', sportFilter)
  }

  if (userParam) {
    if (userParam === 'me') {
      if (auth.session) {
        query = query.eq('user_id', auth.session.user.id)
      } else {
        return respondOk({ clips: [] })
      }
    } else {
      query = query.eq('user_id', userParam)
    }
  }

  const { data: clipRows, error } = await query

  if (error) {
    console.error('[api/clips] list', error)
    return respondError('DATABASE_ERROR', 'Unable to load clips.', 500)
  }

  const clips = await hydrateClips({ clips: clipRows ?? [], supabase, currentUserId: auth.session?.user.id })

  return respondOk({ clips })
}