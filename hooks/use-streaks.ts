import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

interface ActivityDay {
  date: string
  completed: boolean
  sports?: string[]
}

interface StreakData {
  id: string | null
  sportId: number | null
  sportSlug: string | null
  sportName: string
  currentStreak: number
  bestStreak: number
  lastActivityDate: string | null
  weeklyGoal: number
  weeklyProgress: number
  activityCalendar: ActivityDay[]
  totalDaysActive: number
  todayCompleted: boolean
}

interface StreakFreeze {
  id: string
  freezeType: 'earned' | 'purchased' | 'granted'
  earnedByStreakDays: number | null
  purchasedWithCoins: number | null
  status: 'available' | 'used' | 'expired'
  expiresAt: string | null
  autoApply: boolean
  earnedAt: string
  sportSlug: string | null
  sportName: string
}

interface UseStreaksReturn {
  allSportStreak: StreakData | null
  sportStreaks: StreakData[]
  freezes: StreakFreeze[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStreaks(session: Session | null): UseStreaksReturn {
  const [allSportStreak, setAllSportStreak] = useState<StreakData | null>(null)
  const [sportStreaks, setSportStreaks] = useState<StreakData[]>([])
  const [freezes, setFreezes] = useState<StreakFreeze[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStreaks = async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/streaks', {
        credentials: 'include',
      })

      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.error.message)
      }

      setAllSportStreak(result.data.allSportStreak)
      setSportStreaks(result.data.sportStreaks)
      setFreezes(result.data.freezes)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch streaks'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStreaks()
  }, [session])

  return {
    allSportStreak,
    sportStreaks,
    freezes,
    loading,
    error,
    refetch: fetchStreaks,
  }
}
