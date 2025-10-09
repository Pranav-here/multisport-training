import { randomUUID } from 'crypto'

import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import { respondError, respondOk } from '@/lib/api-response'
import { createAdminClient, createServerClient } from '@/lib/supabase-server'

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024 // 200 MB upper bound for clip uploads
const ALLOWED_CONTENT_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'image/jpeg',
  'image/png',
])

const uploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().int().positive(),
})

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as unknown as SupabaseClient<any>
  const { data: auth } = await supabase.auth.getSession()

  if (!auth.session) {
    return respondError('UNAUTHORIZED', 'Sign in required.', 401)
  }

  const payload = await request.json().catch(() => null)
  const parsed = uploadSchema.safeParse(payload)

  if (!parsed.success) {
    return respondError('INVALID_BODY', 'Invalid upload payload.', 400, {
      details: parsed.error.flatten(),
    })
  }

  const { fileName, contentType, fileSize } = parsed.data

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return respondError('UNSUPPORTED_TYPE', 'Unsupported file type.', 400)
  }

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return respondError('FILE_TOO_LARGE', 'File exceeds the 200MB limit.', 400, {
      details: { maxBytes: MAX_FILE_SIZE_BYTES },
    })
  }

  const extension = fileName.includes('.') ? fileName.split('.').pop() ?? '' : ''
  const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'mp4'
  const clipId = randomUUID()
  const path = `user/${auth.session.user.id}/${clipId}.${safeExtension}`

  const admin = createAdminClient()
  const bucket = admin.storage.from('clips')
  const { data, error } = await bucket.createSignedUploadUrl(path)

  if (error || !data) {
    console.error('[api/upload/create-url] createSignedUploadUrl', error)
    return respondError('STORAGE_ERROR', 'Unable to create upload URL.', 500)
  }

  return respondOk({ url: data.signedUrl, path })
}


