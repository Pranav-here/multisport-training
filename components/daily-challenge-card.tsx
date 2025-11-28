'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Clock, Target, Flame, Bell, ExternalLink, TrendingUp } from 'lucide-react'
import type { Challenge } from '@/lib/mock-data'
import { useCountdown } from '@/hooks/use-countdown'
import { cn } from '@/lib/utils'
import { trackChallengeViewed } from '@/lib/analytics'

interface DailyChallengeCardProps {
  challenge: Challenge
  onJoin?: (challenge: Challenge) => void
  className?: string
  currentStreak?: number
  onRemindLater?: () => void
}

export function DailyChallengeCard({ challenge, onJoin, className, currentStreak, onRemindLater }: DailyChallengeCardProps) {
  const [imageSrc, setImageSrc] = useState(challenge.thumbnail || '/placeholder.svg')
  const countdown = useCountdown(challenge.deadline)
  const highlightInstruction = challenge.instructions[0] ?? challenge.title

  // Track challenge view analytics
  useEffect(() => {
    const deadlineMs = new Date(challenge.deadline).getTime()
    const timeRemaining = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000))

    trackChallengeViewed({
      challengeId: challenge.id,
      sport: challenge.sportSlug,
      difficulty: challenge.difficulty,
      points: challenge.points,
      timeRemaining,
    })
  }, [challenge])

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

  const handleImageError = () => {
    if (imageSrc !== '/daily-sports-challenge.png') {
      setImageSrc('/daily-sports-challenge.png')
    }
  }

  const sportBadge = useMemo(() => challenge.sport.replace(/\b\w/g, (char) => char.toUpperCase()), [challenge.sport])

  return (
    <Card
      className={cn(
        'group relative h-full overflow-hidden rounded-3xl border border-white/20 bg-white/[0.12] backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.3)]',
        'transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(15,23,42,0.4)] hover:scale-[1.01]',
        'dark:border-white/12 dark:bg-white/[0.07] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_30px_70px_rgba(0,0,0,0.7)]',
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sport-orange/[0.08] to-sport-blue/[0.08] opacity-60 transition-opacity duration-300 group-hover:opacity-80 dark:from-sport-orange/[0.05] dark:to-sport-blue/[0.05] dark:opacity-40" />
      <div className="relative z-10 grid h-full gap-0 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="order-last flex h-full flex-col gap-6 p-6 sm:p-8 md:order-first">
          <CardHeaderSection
            challengeTitle={challenge.title}
            description={challenge.description}
            difficulty={challenge.difficulty}
            getDifficultyColor={getDifficultyColor}
            currentStreak={currentStreak}
          />

          <ChallengeStats
            points={challenge.points}
            participants={challenge.participants}
            countdownLabel={countdown.timeRemainingLabel}
            isExpired={countdown.isExpired}
            difficulty={challenge.difficulty}
          />

          <div className="mt-auto space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                <Target className="h-4 w-4" />
                {sportBadge}
              </div>
              <Link
                href={`/challenge/${challenge.id}`}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                View details
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="lg"
                className="flex-1 rounded-full px-6 text-base font-semibold"
                onClick={() => onJoin?.(challenge)}
                disabled={countdown.isExpired}
              >
                {countdown.isExpired ? 'Challenge Closed' : 'Join Challenge'}
              </Button>
              {!countdown.isExpired && onRemindLater && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-4"
                  onClick={onRemindLater}
                  title="Remind me in 2 hours"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <ChallengeMedia
          imageSrc={imageSrc}
          challengeTitle={challenge.title}
          highlightInstruction={highlightInstruction}
          countdownLabel={countdown.timeRemainingLabel}
          onImageError={handleImageError}
        />
      </div>
    </Card>
  )
}

interface CardHeaderSectionProps {
  challengeTitle: string
  description: string
  difficulty: string
  getDifficultyColor: (difficulty: string) => string
  currentStreak?: number
}

function CardHeaderSection({ challengeTitle, description, difficulty, getDifficultyColor, currentStreak }: CardHeaderSectionProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Trophy className="h-4 w-4" />
            Daily Challenge
          </div>
          {currentStreak !== undefined && currentStreak > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/20">
              <Flame className="h-3.5 w-3.5" />
              {currentStreak} day streak
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-semibold leading-snug text-foreground">{challengeTitle}</CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Badge className={cn('rounded-full px-3 py-1 text-xs font-semibold capitalize', getDifficultyColor(difficulty))}>
        {difficulty}
      </Badge>
    </div>
  )
}

interface ChallengeMediaProps {
  imageSrc: string
  challengeTitle: string
  highlightInstruction: string
  countdownLabel: string
  onImageError: () => void
}

function ChallengeMedia({ imageSrc, challengeTitle, highlightInstruction, countdownLabel, onImageError }: ChallengeMediaProps) {
  return (
    <CardContent className="relative order-first aspect-[16/11] h-full w-full overflow-hidden p-0 md:order-last">
      <Image
        src={imageSrc}
        alt={challengeTitle}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 560px, (min-width: 768px) 420px, 100vw"
        onError={onImageError}
        priority={false}
      />
      <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 rounded-xl bg-background/80 px-4 py-3 text-sm shadow-lg backdrop-blur">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today&apos;s focus</span>
        <span className="text-base font-semibold leading-tight text-foreground">{highlightInstruction}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{countdownLabel}</span>
        </div>
      </div>
    </CardContent>
  )
}


interface ChallengeStatsProps {
  points: number
  participants: number
  countdownLabel: string
  isExpired: boolean
  difficulty?: string
}

function ChallengeStats({ points, participants, countdownLabel, isExpired, difficulty }: ChallengeStatsProps) {
  // Dynamic point color based on value ranges and difficulty
  const getPointsColor = () => {
    if (points >= 100) return 'text-purple-600 dark:text-purple-400'
    if (points >= 80) return 'text-sport-blue'
    if (points >= 60) return 'text-sport-green'
    return 'text-yellow-600 dark:text-yellow-400'
  }

  const getPointsBadge = () => {
    if (points >= 100) return '🔥'
    if (points >= 80) return '⭐'
    if (difficulty === 'hard') return '💪'
    return '✨'
  }

  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
      <StatPill
        label="Points"
        icon={Trophy}
        value={`${getPointsBadge()} +${points}`}
        valueClassName={getPointsColor()}
      />
      <StatPill
        label="Athletes in"
        icon={Users}
        value={participants.toLocaleString()}
        valueClassName="text-sport-green"
      />
      <StatPill
        label={isExpired ? 'Status' : 'Time left'}
        icon={Clock}
        value={isExpired ? 'Closed' : countdownLabel}
        valueClassName={isExpired ? 'text-muted-foreground' : 'text-sport-orange'}
      />
    </div>
  )
}

interface StatPillProps {
  label: string
  icon: typeof Trophy
  value: string
  valueClassName?: string
}

function StatPill({ label, icon: Icon, value, valueClassName }: StatPillProps) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-border/60 bg-muted/20 p-5 sm:p-6">
      <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-3 flex items-center justify-center">
        <span
          className={cn(
            'text-2xl font-semibold leading-none tracking-tight text-balance-none text-foreground whitespace-nowrap tabular-nums',
            valueClassName,
          )}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
