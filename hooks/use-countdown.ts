import { useEffect, useMemo, useState } from 'react'

const MINUTE_MS = 60 * 1000

export interface CountdownState {
  timeRemainingLabel: string
  isExpired: boolean
}

function formatTimeRemaining(diffMs: number) {
  if (diffMs <= 0) {
    return 'Expired'
  }

  const totalMinutes = Math.round(diffMs / MINUTE_MS)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) {
    return `${minutes}m`
  }

  return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

export function useCountdown(deadlineIso?: string | null): CountdownState {
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    if (!deadlineIso) {
      return undefined
    }

    setNow(Date.now())

    const interval = setInterval(() => {
      setNow(Date.now())
    }, MINUTE_MS)

    return () => clearInterval(interval)
  }, [deadlineIso])

  return useMemo(() => {
    if (!deadlineIso) {
      return {
        timeRemainingLabel: '--',
        isExpired: false,
      }
    }

    const deadlineDate = new Date(deadlineIso)
    if (Number.isNaN(deadlineDate.getTime())) {
      return {
        timeRemainingLabel: '--',
        isExpired: false,
      }
    }

    const diffMs = deadlineDate.getTime() - now

    return {
      timeRemainingLabel: formatTimeRemaining(diffMs),
      isExpired: diffMs <= 0,
    }
  }, [deadlineIso, now])
}
