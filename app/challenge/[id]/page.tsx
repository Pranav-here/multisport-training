'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Trophy, Clock, Users, Target, CheckCircle2, AlertCircle, Video, Upload, Shield } from 'lucide-react'

import { AuthGuard } from '@/components/auth-guard'
import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { ChallengeLeaderboard } from '@/components/challenge-leaderboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { useCountdown } from '@/hooks/use-countdown'
import { useDailyChallenge, getStoredChallenge } from '@/hooks/use-daily-challenge'
import type { Challenge } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function ChallengePage() {
  const params = useParams<{ id?: string }>()
  const router = useRouter()
  const { session } = useAuth()
  const challengeId = params?.id ? String(params.id) : ''
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const countdown = useCountdown(challenge?.deadline || '')

  const { challenge: dailyChallenge } = useDailyChallenge(session)

  useEffect(() => {
    const loadChallenge = async () => {
      setLoading(true)

      // First check session storage
      const stored = getStoredChallenge()
      if (stored && stored.id === challengeId) {
        setChallenge(stored)
        setLoading(false)
        return
      }

      // Check if it's the daily challenge
      if (dailyChallenge && dailyChallenge.id === challengeId) {
        setChallenge(dailyChallenge)
        setLoading(false)
        return
      }

      // In the future, fetch from API
      // For now, redirect to dashboard if not found
      router.push('/dashboard')
    }

    loadChallenge()
  }, [challengeId, dailyChallenge, router])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const sportBadge = useMemo(() => challenge?.sport.replace(/\b\w/g, (char) => char.toUpperCase()), [challenge?.sport])

  const minClipLength = 15 // seconds
  const maxClipLength = 60 // seconds

  if (loading || !challenge) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-background via-background/70 to-muted dark:bg-black">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 rounded-full bg-muted" />
              <div className="h-64 w-full rounded-xl bg-muted" />
              <div className="h-32 w-full rounded-xl bg-muted" />
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background/70 to-muted dark:bg-black">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-44 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-sport-blue/40 via-sport-green/20 to-transparent blur-3xl opacity-70 dark:opacity-30" />
          <div className="absolute -bottom-36 -right-20 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-sport-orange/40 via-sport-blue/25 to-transparent blur-[120px] opacity-70 dark:opacity-25" />
        </div>

        <Header />

        <main className="relative z-10 container mx-auto px-4 py-8 pb-24 max-w-5xl">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_60px_rgba(15,23,42,0.35)]">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="relative aspect-[16/11] w-full overflow-hidden">
                  <Image
                    src={challenge.thumbnail || '/placeholder.svg'}
                    alt={challenge.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn('rounded-full px-3 py-1 text-xs font-semibold capitalize', getDifficultyColor(challenge.difficulty))}>
                        {challenge.difficulty}
                      </Badge>
                      <Badge variant="outline" className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white">
                        {sportBadge}
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    Daily Challenge
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">{challenge.title}</h1>
                  <p className="text-muted-foreground">{challenge.description}</p>

                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Trophy className="h-5 w-5 text-sport-blue" />
                      </div>
                      <div className="text-2xl font-bold text-sport-blue">+{challenge.points}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-5 w-5 text-sport-green" />
                      </div>
                      <div className="text-2xl font-bold text-sport-green">{challenge.participants.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Athletes</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="h-5 w-5 text-sport-orange" />
                      </div>
                      <div className="text-lg font-bold text-sport-orange">{countdown.timeRemainingLabel}</div>
                      <div className="text-xs text-muted-foreground">Left</div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-sport-green" />
                  Challenge Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenge.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sport-blue/10 text-sm font-semibold text-sport-blue">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground pt-1">{instruction}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Submission Requirements */}
            <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-sport-blue" />
                  Submission Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Video length
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {minClipLength}-{maxClipLength} seconds
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Format
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      MP4, MOV, or WebM
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Quality
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      720p minimum, clear footage
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Authenticity
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      Original footage only
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 shrink-0 text-orange-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Anti-Cheat Policy</p>
                      <p className="text-xs text-muted-foreground">
                        All submissions are verified. Using old footage, AI-generated content, or duplicate submissions will result in disqualification and potential account suspension.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scoring Rubric */}
            <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-sport-green" />
                  Scoring Rubric
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Technical Execution</span>
                      <span className="text-xs text-muted-foreground">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Form, technique, and precision</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Consistency</span>
                      <span className="text-xs text-muted-foreground">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Repeatability and control</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Difficulty</span>
                      <span className="text-xs text-muted-foreground">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Challenge level and progression</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Presentation</span>
                      <span className="text-xs text-muted-foreground">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Video quality and clarity</p>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Bonus Points</p>
                      <p className="text-xs text-muted-foreground">
                        Earn +10% for completing with your weak foot/hand, +15% for demonstrating multiple variations, or +20% for exceptional creativity while maintaining form.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <ChallengeLeaderboard challengeId={challenge.id} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-full text-base font-semibold"
                disabled={countdown.isExpired}
                onClick={() => router.push('/upload')}
              >
                <Upload className="h-4 w-4 mr-2" />
                {countdown.isExpired ? 'Challenge Closed' : 'Submit Challenge'}
              </Button>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
