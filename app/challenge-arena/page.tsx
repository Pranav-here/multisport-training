'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Flame, Trophy, Users, Video } from 'lucide-react'

import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useCountdown } from '@/hooks/use-countdown'
import { useToast } from '@/hooks/use-toast'
import type { Challenge } from '@/lib/mock-data'

const COMPLETION_STORAGE_KEY = 'athletiqs-challenge-completions'
const COMPLETION_EVENT = 'athletiqs-challenge-completions-updated'
const DAILY_CHALLENGE_STORAGE_KEY = 'athletiqs-current-challenge'

interface CompletionRecord {
  date: string
  challengeId: string
  notes?: string
}

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const displayDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatIsoDate(date: Date) {
  return isoDateFormatter.format(date)
}

function formatDisplayDate(iso: string) {
  const [year, month, day] = iso.split('-').map((value) => Number(value))
  return displayDateFormatter.format(new Date(year, month - 1, day))
}

function loadCompletionRecords(): CompletionRecord[] {
  if (typeof window === 'undefined') {
    return []
  }
  const stored = window.localStorage.getItem(COMPLETION_STORAGE_KEY)
  if (!stored) {
    return []
  }
  try {
    const parsed = JSON.parse(stored) as CompletionRecord[]
    return parsed
      .filter((entry) => entry?.date && entry?.challengeId)
      .sort((a, b) => (a.date > b.date ? -1 : 1))
  } catch (error) {
    console.warn('[challenge-arena] failed to parse completion records', error)
    window.localStorage.removeItem(COMPLETION_STORAGE_KEY)
    return []
  }
}

function saveCompletionRecords(records: CompletionRecord[]) {
  if (typeof window === 'undefined') {
    return
  }
  const trimmed = records.slice(0, 90)
  window.localStorage.setItem(COMPLETION_STORAGE_KEY, JSON.stringify(trimmed))
  window.dispatchEvent(new Event(COMPLETION_EVENT))
}

function computeStreak(records: CompletionRecord[]) {
  if (!records.length) {
    return 0
  }
  const dates = new Set(records.map((entry) => entry.date))
  const cursor = new Date()
  let streak = 0

  // Count consecutive days starting from today going backwards
  while (true) {
    const key = formatIsoDate(cursor)
    if (!dates.has(key)) {
      break
    }
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function loadStoredChallenge(): Challenge | null {
  if (typeof window === 'undefined') {
    return null
  }
  const cached = window.sessionStorage.getItem(DAILY_CHALLENGE_STORAGE_KEY)
  if (!cached) {
    return null
  }
  try {
    return JSON.parse(cached) as Challenge
  } catch {
    window.sessionStorage.removeItem(DAILY_CHALLENGE_STORAGE_KEY)
    return null
  }
}

export default function ChallengeArenaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const countdown = useCountdown(challenge?.deadline || '')
  const [proofNote, setProofNote] = useState('')
  const [records, setRecords] = useState<CompletionRecord[]>(() => loadCompletionRecords())

  useEffect(() => {
    const stored = loadStoredChallenge()
    setChallenge(stored)
    setLoading(false)

    if (!stored) {
      router.push('/dashboard')
    }
  }, [router])

  const todayKey = formatIsoDate(new Date())
  const challengeCompletions = useMemo(() => {
    if (!challenge) {
      return []
    }
    return records.filter((entry) => entry.challengeId === challenge.id)
  }, [records, challenge])

  const completedToday = useMemo(() => {
    if (!challenge) {
      return false
    }
    return challengeCompletions.some((entry) => entry.date === todayKey)
  }, [challenge, challengeCompletions, todayKey])

  const currentStreak = useMemo(() => computeStreak(records), [records])
  const totalCompleted = records.length
  const lastCompletion = useMemo(() => challengeCompletions.at(0) ?? null, [challengeCompletions])

  const handleMarkComplete = useCallback(() => {
    if (!challenge) {
      return
    }

    const trimmedNote = proofNote.trim()
    const updatedRecords = (() => {
      const withoutToday = records.filter(
        (entry) => !(entry.challengeId === challenge.id && entry.date === todayKey),
      )
      return [
        {
          date: todayKey,
          challengeId: challenge.id,
          notes: trimmedNote || undefined,
        },
        ...withoutToday,
      ]
    })()

    setRecords(updatedRecords)
    saveCompletionRecords(updatedRecords)
    setProofNote('')

    toast({
      title: 'Challenge recorded',
      description: 'Nice work! Your proof is saved and streak updated.',
    })
  }, [challenge, proofNote, records, todayKey, toast])

  const handleResetProgress = useCallback(() => {
    setRecords([])
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(COMPLETION_STORAGE_KEY)
      window.dispatchEvent(new Event(COMPLETION_EVENT))
    }
    toast({
      title: 'Progress reset',
      description: 'Your challenge streak history has been cleared.',
    })
  }, [toast])

  const activeChallenge = challenge

  return (
      <div className='min-h-screen bg-background'>
        <Header />


        <main className='container mx-auto px-4 py-6 space-y-6'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <Button variant='ghost' onClick={() => router.push('/dashboard')} className='gap-2'>
              <ArrowLeft className='h-4 w-4' />
              Back to dashboard
            </Button>

            {activeChallenge ? (
              <Badge variant='outline' className='flex items-center gap-2 text-sm'>
                <Flame className='h-4 w-4 text-orange-500' />
                {countdown.isExpired ? 'Challenge expired' : `${countdown.timeRemainingLabel} left`}
              </Badge>
            ) : null}
          </div>

          {loading && !activeChallenge ? (
            <Card className='border-dashed border-muted-foreground/20 bg-card/70 shadow-sm'>
              <CardContent className='space-y-4 p-6 animate-pulse'>
                <div className='h-6 w-48 rounded bg-muted' />
                <div className='h-4 w-full rounded bg-muted' />
                <div className='h-4 w-3/4 rounded bg-muted' />
                <div className='h-64 w-full rounded-xl bg-muted' />
              </CardContent>
            </Card>
          ) : activeChallenge ? (
            <div className='grid gap-6 lg:grid-cols-3'>
              <div className='lg:col-span-2 space-y-6'>
                <Card>
                  <CardHeader className='space-y-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='secondary' className='uppercase tracking-wide text-xs'>
                        {activeChallenge.sport}
                      </Badge>
                      <Badge variant='outline' className='capitalize'>
                        {activeChallenge.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className='text-2xl font-bold leading-tight'>{activeChallenge.title}</CardTitle>
                    <CardDescription className='text-base text-muted-foreground'>
                      {activeChallenge.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4 text-sm text-muted-foreground'>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                      <div className='rounded-lg border border-muted-foreground/10 bg-muted/40 p-4'>
                        <div className='flex items-center gap-2 font-medium text-muted-foreground'>
                          <Trophy className='h-4 w-4 text-sport-blue' />
                          Reward
                        </div>
                        <p className='mt-1 text-lg font-semibold text-foreground'>
                          +{activeChallenge.points} points
                        </p>
                      </div>
                      <div className='rounded-lg border border-muted-foreground/10 bg-muted/40 p-4'>
                        <div className='flex items-center gap-2 font-medium text-muted-foreground'>
                          <Users className='h-4 w-4 text-sport-green' />
                          Athletes joined
                        </div>
                        <p className='mt-1 text-lg font-semibold text-foreground'>
                          {activeChallenge.participants.toLocaleString()}
                        </p>
                      </div>
                      <div className='rounded-lg border border-muted-foreground/10 bg-muted/40 p-4'>
                        <div className='flex items-center gap-2 font-medium text-muted-foreground'>
                          <Flame className='h-4 w-4 text-orange-500' />
                          Time left
                        </div>
                        <p className='mt-1 text-lg font-semibold text-foreground'>
                          {countdown.timeRemainingLabel}
                        </p>
                      </div>
                    </div>
                    <p>
                      Deadline:{' '}
                      <span className='font-medium text-foreground'>
                        {activeChallenge.deadline ? new Date(activeChallenge.deadline).toLocaleString() : '—'}
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>How to complete it</CardTitle>
                    <CardDescription>Follow each step to earn today&apos;s challenge badge.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className='space-y-3 text-sm text-muted-foreground'>
                      {activeChallenge.instructions.map((instruction: string, index: number) => (
                        <li key={`${instruction}-${index}`} className='flex items-start gap-3'>
                          <CheckCircle2 className='mt-0.5 h-4 w-4 text-sport-green' />
                          <span>
                            <span className='font-semibold text-foreground'>Step {index + 1}.</span> {instruction}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Coach walkthrough</CardTitle>
                    <CardDescription>Watch the breakdown and record your attempt.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='relative aspect-video overflow-hidden rounded-xl border border-dashed border-muted-foreground/40 bg-muted/60'>
                      <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-muted-foreground'>
                        <Video className='h-10 w-10 text-sport-blue' />
                        <div>
                          <p className='text-sm font-medium text-foreground'>Video walkthrough coming soon</p>
                          <p className='text-xs text-muted-foreground'>
                            Upload a clip in the proof section once you complete your reps.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Share your proof</CardTitle>
                    <CardDescription>Add quick notes or links to your clip before marking this challenge done.</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <Textarea
                      value={proofNote}
                      onChange={(event) => setProofNote(event.target.value)}
                      placeholder='Example: Posted my wall-touch drill to the team chat at 6:45pm.'
                      rows={4}
                    />
                    <div className='flex flex-wrap items-center gap-3'>
                      <Button onClick={handleMarkComplete} disabled={!activeChallenge || completedToday}>
                        {completedToday ? 'Logged for today' : 'Mark challenge complete'}
                      </Button>
                      <Button variant='outline' disabled>
                        Upload proof (coming soon)
                      </Button>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      We store a private timestamp so you can keep a history of completed challenges.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <aside className='lg:col-span-1 space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Challenge streak</CardTitle>
                    <CardDescription>Stay consistent to keep your streak alive.</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between rounded-lg border border-muted-foreground/10 bg-muted/40 p-3'>
                      <div>
                        <p className='text-xs text-muted-foreground uppercase tracking-wide'>Current streak</p>
                        <p className='text-2xl font-semibold text-foreground'>{currentStreak} days</p>
                      </div>
                      <Flame className='h-6 w-6 text-orange-500' />
                    </div>
                    <div className='grid grid-cols-2 gap-3 text-sm text-muted-foreground'>
                      <div className='rounded-lg border border-muted-foreground/10 bg-background/90 p-3'>
                        <p className='text-xs uppercase tracking-wide'>Completed today</p>
                        <p className='mt-1 text-lg font-semibold text-foreground'>{completedToday ? 'Yes' : 'No'}</p>
                      </div>
                      <div className='rounded-lg border border-muted-foreground/10 bg-background/90 p-3'>
                        <p className='text-xs uppercase tracking-wide'>Total challenges</p>
                        <p className='mt-1 text-lg font-semibold text-foreground'>{totalCompleted}</p>
                      </div>
                    </div>
                    <Button variant='ghost' size='sm' className='text-xs text-muted-foreground' onClick={handleResetProgress}>
                      Reset streak history
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Latest proof</CardTitle>
                    <CardDescription>Track what you submitted for this challenge.</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm text-muted-foreground'>
                    {challengeCompletions.length === 0 ? (
                      <p>No proof logged yet for this challenge.</p>
                    ) : (
                      <ul className='space-y-3'>
                        {challengeCompletions.slice(0, 5).map((entry) => (
                          <li key={`${entry.challengeId}-${entry.date}`} className='rounded-lg border border-muted-foreground/10 bg-muted/40 p-3'>
                            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                              {formatDisplayDate(entry.date)}
                            </p>
                            <p className='mt-1 font-medium text-foreground'>
                              {entry.notes ?? 'Marked complete without additional notes.'}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                    {lastCompletion ? (
                      <p className='text-xs text-muted-foreground'>
                        Last updated on {formatDisplayDate(lastCompletion.date)}.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </aside>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No active challenge</CardTitle>
                <CardDescription>
                  Return to the dashboard to grab today&apos;s challenge and come back when you&apos;re ready to log it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant='default' onClick={() => router.push('/dashboard')}>
                  Go to dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </main>

        <MobileNav />
      </div>
  )
}
