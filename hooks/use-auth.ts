"use client"

import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

interface ProfileRow {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
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
}

export function useAuth() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [state, setState] = useState<AuthState>({
    session: null,
    profile: null,
    isLoading: true,
  })

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    setState((prev) => ({
      ...prev,
      profile: data ?? null,
    }))
  }

  useEffect(() => {
    let isMounted = true

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return

      setState((prev) => ({
        ...prev,
        session: data.session,
        isLoading: false,
      }))

      if (data.session) {
        await loadProfile(data.session.user.id)
      } else {
        setState((prev) => ({ ...prev, profile: null }))
      }
    }

    syncSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setState((prev) => ({
        ...prev,
        session,
        isLoading: false,
      }))
      if (session) {
        void loadProfile(session.user.id)
      } else {
        setState((prev) => ({ ...prev, profile: null }))
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const user: AuthUser | null = useMemo(() => {
    const session = state.session
    if (!session) return null

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
  }, [state.profile, state.session])

  const refreshProfile = async () => {
    if (state.session) {
      await loadProfile(state.session.user.id)
    }
  }

  return {
    session: state.session,
    profile: state.profile,
    user,
    isAuthenticated: Boolean(state.session),
    isLoading: state.isLoading,
    refreshProfile,
  }
}
