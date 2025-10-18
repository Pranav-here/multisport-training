import type { Session, User } from '@supabase/supabase-js'

export const PLACEHOLDER_AUTH_COOKIE = 'athletiqs-placeholder-auth'
export const PLACEHOLDER_AUTH_COOKIE_VALUE = 'active'
export const PLACEHOLDER_AUTH_STORAGE_KEY = 'athletiqs-placeholder-auth-active'
export const PLACEHOLDER_AUTH_EVENT = 'athletiqs-placeholder-auth-change'
export const PLACEHOLDER_AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

const PLACEHOLDER_ID = 'placeholder-user'
const PLACEHOLDER_EMAIL = 'demo-athlete@athletiqs.local'
const PLACEHOLDER_DISPLAY_NAME = 'Demo Athlete'
const PLACEHOLDER_USERNAME = 'demo-athlete'

export function isPlaceholderAuthEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_PLACEHOLDER_AUTH?.toLowerCase()

  if (flag === 'true') {
    return true
  }

  if (flag === 'false') {
    return false
  }

  return process.env.NODE_ENV !== 'production'
}

export function getPlaceholderUser() {
  return {
    id: PLACEHOLDER_ID,
    email: PLACEHOLDER_EMAIL,
    displayName: PLACEHOLDER_DISPLAY_NAME,
    username: PLACEHOLDER_USERNAME,
    avatarUrl: null,
  }
}

export function createPlaceholderSession(): Session {
  const now = new Date()
  const isoTimestamp = now.toISOString()
  const expiresInSeconds = 60 * 60 * 24

  const user: User = {
    id: PLACEHOLDER_ID,
    app_metadata: {
      provider: 'placeholder',
    },
    user_metadata: {
      full_name: PLACEHOLDER_DISPLAY_NAME,
      avatar_url: null,
    },
    aud: 'authenticated',
    email: PLACEHOLDER_EMAIL,
    created_at: isoTimestamp,
    last_sign_in_at: isoTimestamp,
    updated_at: isoTimestamp,
    role: 'authenticated',
    identities: [],
    factors: [],
  }

  return {
    access_token: 'placeholder-access-token',
    refresh_token: 'placeholder-refresh-token',
    expires_in: expiresInSeconds,
    expires_at: Math.floor(now.getTime() / 1000) + expiresInSeconds,
    token_type: 'bearer',
    provider_token: null,
    provider_refresh_token: null,
    user,
  }
}
