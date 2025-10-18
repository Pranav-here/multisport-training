'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { useToast } from '@/hooks/use-toast'
import { generateFallbackChallenge } from '@/lib/daily-challenge'
import type { Challenge } from '@/lib/mock-data'

export const DAILY_CHALLENGE_STORAGE_KEY = 'athletiqs-current-challenge'

interface UseDailyChallengeOptions {
  isPlaceholderSession?: boolean
  preferredSports?: Array<{ slug: string; name: string }>
}

function isChallengeExpired(challenge: Challenge | null): boolean {
  if (!challenge?.deadline) {
    return true
  }
  const deadlineTs = new Date(challenge.deadline).getTime()
  if (Number.isNaN(deadlineTs)) {
    return true
  }
  return Date.now() >= deadlineTs
}

function isLocalFallback(challenge: Challenge | null): boolean {
  return Boolean(challenge?.id?.startsWith('local-fallback-'))
}

function storeChallenge(challenge: Challenge | null) {
  if (typeof window === 'undefined') {
    return
  }
  if (!challenge) {
    window.sessionStorage.removeItem(DAILY_CHALLENGE_STORAGE_KEY)
    return
  }
  window.sessionStorage.setItem(DAILY_CHALLENGE_STORAGE_KEY, JSON.stringify(challenge))
}

function loadCachedChallenge() {
  if (typeof window === 'undefined') {
    return null
  }
  const cached = window.sessionStorage.getItem(DAILY_CHALLENGE_STORAGE_KEY)
  if (!cached) {
    return null
  }
  try {
    const parsed = JSON.parse(cached) as Challenge
    if (isChallengeExpired(parsed)) {
      window.sessionStorage.removeItem(DAILY_CHALLENGE_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    window.sessionStorage.removeItem(DAILY_CHALLENGE_STORAGE_KEY)
    return null
  }
}

export function useDailyChallenge(session: Session | null, options: UseDailyChallengeOptions = {}) {
  const { isPlaceholderSession = false, preferredSports } = options
  const { toast } = useToast()
  const [challenge, setChallenge] = useState<Challenge | null>(() => loadCachedChallenge())
  const [loading, setLoading] = useState(false)
  const hasFetchedRef = useRef<boolean>(
    Boolean(challenge) && !isChallengeExpired(challenge) && !isLocalFallback(challenge),
  )
  const warmStartRef = useRef<Challenge | null>(null)
  const userId = session?.user?.id ?? null

  const buildFallbackChallenge = useCallback(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
    return generateFallbackChallenge({
      userId: userId ?? 'local-user',
      sports: preferredSports,
      timeZone,
      idPrefix: 'local-fallback',
    })
  }, [preferredSports, userId])

  const acquireFallbackChallenge = useCallback(() => {
    const fallback = warmStartRef.current ?? buildFallbackChallenge()
    warmStartRef.current = fallback
    return fallback
  }, [buildFallbackChallenge])

  const refresh = useCallback(async () => {
    if (!session || isPlaceholderSession) {
      const fallbackChallenge = acquireFallbackChallenge()
      setChallenge(fallbackChallenge)
      storeChallenge(fallbackChallenge)
      hasFetchedRef.current = true
      setLoading(false)
      return
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
    setLoading(true)

    const controller = new AbortController()
    let timeoutId: number | undefined

    try {
      timeoutId = window.setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`/api/daily-challenge?tz=${encodeURIComponent(timeZone)}`, {
        credentials: 'include',
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const payload = (await response.json()) as { challenge: Challenge }
      warmStartRef.current = null
      hasFetchedRef.current = true
      setChallenge(payload.challenge)
      storeChallenge(payload.challenge)
    } catch (error) {
      console.error('[daily-challenge] failed to load challenge', error)

      const fallbackChallenge = acquireFallbackChallenge()
      hasFetchedRef.current = true
      setChallenge(fallbackChallenge)
      storeChallenge(fallbackChallenge)

      if (!isPlaceholderSession) {
        toast({
          title: 'Using fallback challenge',
          description: "Could not refresh today's challenge. Showing a backup option.",
        })
      }
    } finally {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      setLoading(false)
    }
  }, [acquireFallbackChallenge, isPlaceholderSession, session, toast])

  useEffect(() => {
    if (!session) {
      setChallenge(null)
      storeChallenge(null)
      hasFetchedRef.current = false
      warmStartRef.current = null
      return
    }

    if (!challenge || isChallengeExpired(challenge)) {
      const fallbackChallenge = acquireFallbackChallenge()
      setChallenge(fallbackChallenge)
      storeChallenge(fallbackChallenge)
    }

    if (!hasFetchedRef.current && !loading) {
      hasFetchedRef.current = true
      void refresh()
    }
  }, [acquireFallbackChallenge, challenge, loading, refresh, session])

  useEffect(() => {
    if (!challenge?.deadline) {
      return
    }

    const deadlineTs = new Date(challenge.deadline).getTime()
    if (Number.isNaN(deadlineTs)) {
      return
    }

    const delayMs = deadlineTs - Date.now() + 1000

    if (delayMs <= 0) {
      hasFetchedRef.current = false
      warmStartRef.current = null
      void refresh()
      return
    }

    const timeoutId = window.setTimeout(() => {
      hasFetchedRef.current = false
      warmStartRef.current = null
      void refresh()
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [challenge?.deadline, refresh])

  const value = useMemo(
    () => ({
      challenge,
      loading,
      refresh,
    }),
    [challenge, loading, refresh],
  )

  return value
}

export function getStoredChallenge(): Challenge | null {
  return loadCachedChallenge()
}
