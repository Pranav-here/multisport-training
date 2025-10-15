'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { useToast } from '@/hooks/use-toast'
import { mockChallenge, type Challenge } from '@/lib/mock-data'

export const DAILY_CHALLENGE_STORAGE_KEY = 'athletiq-current-challenge'

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

function computeLocalMidnightDeadline(): string {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
  return midnight.toISOString()
}

function buildWarmStartChallenge(): Challenge {
  const now = new Date()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
  const challengeDate = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(now)

  return {
    ...mockChallenge,
    id: `local-fallback-${challengeDate}`,
    instructions: [...mockChallenge.instructions],
    generatedAt: now.toISOString(),
    challengeDate,
    timeZone,
    deadline: computeLocalMidnightDeadline(),
  }
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

export function useDailyChallenge(session: Session | null) {
  const { toast } = useToast()
  const [challenge, setChallenge] = useState<Challenge | null>(() => loadCachedChallenge())
  const [loading, setLoading] = useState(false)
  const hasFetchedRef = useRef<boolean>(Boolean(challenge) && !isChallengeExpired(challenge) && !isLocalFallback(challenge))
  const warmStartRef = useRef<Challenge | null>(null)

  const refresh = useCallback(async () => {
    if (!session) {
      return
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
    setLoading(true)

    const controller = new AbortController()
    let timeoutId: ReturnType<typeof window.setTimeout> | undefined

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
      setChallenge(payload.challenge)
      storeChallenge(payload.challenge)
      warmStartRef.current = null
    } catch (error) {
      console.error('[daily-challenge] failed to load challenge', error)

      const fallbackChallenge = warmStartRef.current ?? buildWarmStartChallenge()
      warmStartRef.current = fallbackChallenge

      setChallenge(fallbackChallenge)
      storeChallenge(fallbackChallenge)

      toast({
        title: 'Using fallback challenge',
        description: "Could not refresh today's challenge. Showing a backup option.",
      })
    } finally {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      setLoading(false)
    }
  }, [session, toast])

  useEffect(() => {
    if (!session) {
      setChallenge(null)
      storeChallenge(null)
      hasFetchedRef.current = false
      warmStartRef.current = null
      return
    }

    const expired = !challenge || isChallengeExpired(challenge) || isLocalFallback(challenge)

    if (!challenge) {
      if (!warmStartRef.current) {
        warmStartRef.current = buildWarmStartChallenge()
      }
      setChallenge(warmStartRef.current)
    }

    if (!hasFetchedRef.current && !loading) {
      hasFetchedRef.current = true
      void refresh()
    }
  }, [challenge, loading, refresh, session])

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
      void refresh()
      return
    }

    const timeoutId = setTimeout(() => {
      hasFetchedRef.current = false
      void refresh()
    }, delayMs)

    return () => clearTimeout(timeoutId)
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
