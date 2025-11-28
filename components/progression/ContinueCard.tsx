'use client'

import { motion } from 'framer-motion'
import { Clock, Flame, Flag, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Level, Progress } from '@/lib/progression/types'

interface ContinueCardProps {
  level: Level | null
  progress: Progress | null
  milestoneLevelNumber: number | null
  milestoneLevelsRemaining: number | null
  timeRemainingMinutes: number
  onStart: (level: Level) => void
}

export function ContinueCard({
  level,
  progress,
  milestoneLevelNumber,
  milestoneLevelsRemaining,
  timeRemainingMinutes,
  onStart,
}: ContinueCardProps) {
  if (!level) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-lg font-semibold text-foreground">You are up to date</p>
        <p className="mt-1 text-sm text-muted-foreground">
          As soon as a coach drops a new level, it will appear here ready to launch.
        </p>
      </div>
    )
  }

  const nextMilestoneLabel =
    milestoneLevelNumber && milestoneLevelsRemaining !== null
      ? `Next milestone · Level ${milestoneLevelNumber} (${milestoneLevelsRemaining} to go)`
      : 'Keep stacking reps'

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-sport-blue/20 via-sport-green/10 to-transparent p-6 shadow-[0_35px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.25),transparent_55%)]" />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <Badge className="rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-sport-blue shadow-[0_0_25px_rgba(37,99,235,0.3)]">
            Continue level
          </Badge>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.5rem]">
              Level {level.number}: {level.title}
            </h2>
            <p className="mt-2 max-w-xl text-base text-muted-foreground sm:text-lg">
              {level.objectives[0]} · {level.estMinutes} minute workflow · {level.difficulty}/5 intensity
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            <ContinueStat
              icon={<Flag className="h-4 w-4 text-sport-blue" />}
              label="Next milestone"
              value={nextMilestoneLabel}
            />
            <ContinueStat
              icon={<Clock className="h-4 w-4 text-sport-green" />}
              label="Time remaining this week"
              value={`${timeRemainingMinutes} minutes`}
            />
            <ContinueStat
              icon={<Flame className="h-4 w-4 text-sport-orange" />}
              label="Streak"
              value={`${progress?.streakDays ?? 0} days active`}
            />
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={() => onStart(level)}
            size="lg"
            className="w-full gap-2 rounded-full bg-gradient-to-r from-sport-blue to-sport-green px-6 text-base font-semibold text-white shadow-[0_25px_55px_rgba(59,130,246,0.45)] transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto"
            aria-label={`Start level ${level.number}`}
          >
            <Play className="h-4 w-4" />
            {level.status === 'in_progress' ? 'Resume level' : 'Start level'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

interface ContinueStatProps {
  label: string
  value: string
  icon: React.ReactNode
}

function ContinueStat({ label, value, icon }: ContinueStatProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sport-blue">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
        <p className={cn('truncate text-sm font-semibold text-foreground')}>{value}</p>
      </div>
    </div>
  )
}
