"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import {
  PLACEHOLDER_AUTH_COOKIE,
  PLACEHOLDER_AUTH_COOKIE_VALUE,
  PLACEHOLDER_AUTH_EVENT,
  PLACEHOLDER_AUTH_STORAGE_KEY,
  activatePlaceholderAuth,
  createPlaceholderSession,
  getPlaceholderUser,
  isPlaceholderAuthEnabled,
} from '@/lib/auth-placeholder'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

interface ProfileRow {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  location: string | null
}

interface AuthUser {
  id: string
  email: string
  displayName: string
  username: string | null
  avatarUrl: string | null
}

interface AuthState {
  session: Session | null
  profile: ProfileRow | null
  isLoading: boolean
  placeholderActive: boolean
}

function detectPlaceholderSession(enabled: boolean): boolean {
  if (!enabled) {
    return false
  }

  if (typeof document === 'undefined') {
    return false
  }

  const cookieActive = document.cookie
    .split(';')
    .map((part) => part.trim())
    .some((part) => part.startsWith(`${PLACEHOLDER_AUTH_COOKIE}=${PLACEHOLDER_AUTH_COOKIE_VALUE}`))

  if (cookieActive) {
    return true
  }

  if (typeof window !== 'undefined') {
    try {
      return window.localStorage.getItem(PLACEHOLDER_AUTH_STORAGE_KEY) === 'true'
    } catch {
      // ignore storage access issues
    }
  }

  return false
}

export function useAuth() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const placeholderAuthEnabled = useMemo(() => isPlaceholderAuthEnabled(), [])
  const [state, setState] = useState<AuthState>(() => {
    const placeholderActive = (() => {
      if (!placeholderAuthEnabled) {
        return detectPlaceholderSession(false)
      }

      const detected = detectPlaceholderSession(true)
      if (detected) {
        return true
      }

      return activatePlaceholderAuth()
    })()

    return {
      session: placeholderActive ? createPlaceholderSession() : null,
      profile: null,
      isLoading: !placeholderActive,
      placeholderActive,
    }
  })

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, location')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        throw error
      }

      setState((prev) => ({
        ...prev,
        profile: data ?? null,
      }))
    } catch (error) {
      console.error('[auth] failed to load profile', error)
      setState((prev) => ({
        ...prev,
        profile: null,
      }))
    }
  }, [supabase])

  const syncSession = useCallback(async () => {
    let placeholderActive = detectPlaceholderSession(placeholderAuthEnabled)

    if (placeholderAuthEnabled && !placeholderActive) {
      placeholderActive = activatePlaceholderAuth()
    }

    if (placeholderActive) {
      setState((prev) => ({
        ...prev,
        session: prev.placeholderActive && prev.session ? prev.session : createPlaceholderSession(),
        profile: null,
        placeholderActive: true,
        isLoading: false,
      }))
      return
    }

    try {
      const { data } = await supabase.auth.getSession()

      setState((prev) => ({
        ...prev,
        session: data.session,
        placeholderActive: false,
        isLoading: false,
      }))

      if (data.session) {
        await loadProfile(data.session.user.id)
      } else {
        setState((prev) => ({ ...prev, profile: null }))
      }
    } catch (error) {
      console.error('[auth] failed to sync session', error)
      setState((prev) => ({
        ...prev,
        session: null,
        profile: null,
        placeholderActive: false,
        isLoading: false,
      }))
    }
  }, [loadProfile, placeholderAuthEnabled, supabase])

  useEffect(() => {
    let isActive = true

    void syncSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) {
        return
      }

      const placeholderActive = detectPlaceholderSession(placeholderAuthEnabled)

      if (placeholderActive) {
        setState((prev) => ({
          ...prev,
          session: prev.placeholderActive && prev.session ? prev.session : createPlaceholderSession(),
          profile: null,
          placeholderActive: true,
          isLoading: false,
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        session,
        placeholderActive: false,
        isLoading: false,
      }))

      if (session) {
        void loadProfile(session.user.id)
      } else {
        setState((prev) => ({ ...prev, profile: null }))
      }
    })

    const handlePlaceholderEvent = () => {
      if (!isActive) {
        return
      }
      void syncSession()
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === PLACEHOLDER_AUTH_STORAGE_KEY) {
        handlePlaceholderEvent()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(PLACEHOLDER_AUTH_EVENT, handlePlaceholderEvent)
      window.addEventListener('storage', handleStorage)
    }

    return () => {
      isActive = false
      subscription.unsubscribe()
      if (typeof window !== 'undefined') {
        window.removeEventListener(PLACEHOLDER_AUTH_EVENT, handlePlaceholderEvent)
        window.removeEventListener('storage', handleStorage)
      }
    }
  }, [loadProfile, placeholderAuthEnabled, supabase, syncSession])

  const user: AuthUser | null = useMemo(() => {
    if (state.placeholderActive) {
      return getPlaceholderUser()
    }

    const session = state.session
    if (!session) {
      return null
    }

    const email = session.user.email ?? ''
    const metadataName = session.user.user_metadata?.full_name
    const profileName = state.profile?.display_name

    return {
      id: session.user.id,
      email,
      displayName: profileName ?? metadataName ?? email.split('@')[0] ?? 'Athlete',
      username: state.profile?.username ?? null,
      avatarUrl: state.profile?.avatar_url ?? session.user.user_metadata?.avatar_url ?? null,
    }
  }, [state.placeholderActive, state.profile, state.session])

  const refreshProfile = useCallback(async () => {
    if (state.placeholderActive || !state.session) {
      return
    }
    await loadProfile(state.session.user.id)
  }, [loadProfile, state.placeholderActive, state.session])

  return {
    session: state.session,
    profile: state.profile,
    user,
    isAuthenticated: state.placeholderActive || Boolean(state.session),
    isPlaceholder: state.placeholderActive,
    isLoading: state.isLoading,
    refreshProfile,
  }
}
