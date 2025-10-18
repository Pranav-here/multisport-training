'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Clock, Target } from 'lucide-react'
import type { Challenge } from '@/lib/mock-data'
import { useCountdown } from '@/hooks/use-countdown'
import { cn } from '@/lib/utils'

interface DailyChallengeCardProps {
  challenge: Challenge
  onJoin?: (challenge: Challenge) => void
  className?: string
}

export function DailyChallengeCard({ challenge, onJoin, className }: DailyChallengeCardProps) {
  const [imageSrc, setImageSrc] = useState(challenge.thumbnail || '/placeholder.svg')
  const countdown = useCountdown(challenge.deadline)
  const highlightInstruction = challenge.instructions[0] ?? challenge.title

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
        'h-full overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        className,
      )}
    >
      <div className="grid h-full gap-0 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="order-last flex h-full flex-col gap-6 p-6 sm:p-8 md:order-first">
          <CardHeaderSection
            challengeTitle={challenge.title}
            description={challenge.description}
            difficulty={challenge.difficulty}
            getDifficultyColor={getDifficultyColor}
          />

          <ChallengeStats
            points={challenge.points}
            participants={challenge.participants}
            countdownLabel={countdown.timeRemainingLabel}
            isExpired={countdown.isExpired}
          />

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4" />
              {sportBadge}
            </div>
            <Button
              size="lg"
              className="w-full rounded-full px-6 text-base font-semibold sm:w-auto"
              onClick={() => onJoin?.(challenge)}
              disabled={countdown.isExpired}
            >
              {countdown.isExpired ? 'Challenge Closed' : 'Join Challenge'}
            </Button>
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
}

function CardHeaderSection({ challengeTitle, description, difficulty, getDifficultyColor }: CardHeaderSectionProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Trophy className="h-4 w-4" />
          Daily Challenge
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
}

function ChallengeStats({ points, participants, countdownLabel, isExpired }: ChallengeStatsProps) {
  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
      <StatPill label="Points" icon={Trophy}>
        <span className="text-2xl font-semibold text-sport-blue">+{points}</span>
      </StatPill>
      <StatPill label="Athletes in" icon={Users}>
        <span className="text-2xl font-semibold text-sport-green">{participants.toLocaleString()}</span>
      </StatPill>
      <StatPill label={isExpired ? 'Status' : 'Time left'} icon={Clock}>
        <span className={cn('text-2xl font-semibold', isExpired ? 'text-muted-foreground' : 'text-sport-orange')}>
          {isExpired ? 'Closed' : countdownLabel}
        </span>
      </StatPill>
    </div>
  )
}

function StatPill({ label, icon: Icon, children }: { label: string; icon: typeof Trophy; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-border/60 bg-muted/20 p-5 sm:p-6">
      <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-3 text-foreground break-words">{children}</div>
    </div>
  )
}
