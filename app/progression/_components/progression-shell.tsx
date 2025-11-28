'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Play, CalendarPlus, BookmarkPlus } from 'lucide-react'

import { ContinueCard } from '@/components/progression/ContinueCard'
import { LevelDetails } from '@/components/progression/LevelDetails'
import { LevelGrid } from '@/components/progression/LevelGrid'
import { MomentumPanel } from '@/components/progression/MomentumPanel'
import { PlannerDialog } from '@/components/progression/PlannerDialog'
import { WorldArcTabs } from '@/components/progression/WorldArcTabs'
import { GridSkeleton, DetailsSkeleton } from '@/components/progression/Skeletons'
import {
  useProgressionStore,
  selectFilters,
  selectFilteredLevels,
  selectProgress,
  selectResultCount,
  selectSelectedLevel,
  selectWorlds,
  selectNudges,
  selectContinueLevel,
} from '@/lib/progression/store'
import type { Level } from '@/lib/progression/types'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useToast } from '@/hooks/use-toast'
import { track } from '@/lib/analytics'

const MILESTONES = [10, 40, 60, 80, 100, 120]

interface ProgressionShellProps {
  initialWorldId?: string | null
  initialLevelId?: string | null
}

export function ProgressionShell({ initialWorldId, initialLevelId }: ProgressionShellProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [sessionOpen, setSessionOpen] = useState(false)
  const [sessionCountdown, setSessionCountdown] = useState(5)
  const [sessionLevel, setSessionLevel] = useState<Level | null>(null)

  const worlds = useProgressionStore(selectWorlds)
  const filters = useProgressionStore(selectFilters)
  const filteredLevels = useProgressionStore(selectFilteredLevels)
  const resultCount = useProgressionStore(selectResultCount)
  const selectedLevel = useProgressionStore(selectSelectedLevel)
  const continueLevel = useProgressionStore(selectContinueLevel)
  const progress = useProgressionStore(selectProgress)
  const nudges = useProgressionStore(selectNudges)
  const loading = useProgressionStore((state) => state.loading)
  const error = useProgressionStore((state) => state.error)
  const selectedWorldId = useProgressionStore((state) => state.selectedWorldId)
  const weeklyPlan = useProgressionStore((state) => state.weeklyPlan)
  const allLevels = useProgressionStore((state) => state.levels)
  const actions = useProgressionStore((state) => state.actions)

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    actions.load()
  }, [actions])

  const [paramsApplied, setParamsApplied] = useState(false)

  useEffect(() => {
    if (paramsApplied) {
      return
    }
    if (!allLevels.length) {
      return
    }
    if (initialLevelId) {
      const level = allLevels.find((entry) => entry.id === initialLevelId)
      if (level) {
        actions.setSelectedWorld(level.worldId)
        actions.setSelectedLevel(level.id)
        setParamsApplied(true)
        return
      }
    }
    if (initialWorldId) {
      actions.setSelectedWorld(initialWorldId)
      setParamsApplied(true)
      return
    }
    setParamsApplied(true)
  }, [actions, allLevels, initialLevelId, initialWorldId, paramsApplied])

  useEffect(() => {
    if (!sessionOpen) {
      return
    }
    if (sessionCountdown === 0) {
      setSessionOpen(false)
      if (sessionLevel) {
        actions.markLevelComplete(sessionLevel.id)
        track('progression_completed', { levelId: sessionLevel.id })
        toast({
          title: `Level ${sessionLevel.number} complete`,
          description: 'Nice work. Keep the streak alive.',
        })
      }
      setSessionCountdown(5)
      return
    }
    const timer = setTimeout(() => setSessionCountdown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [sessionCountdown, sessionOpen, sessionLevel, actions, toast])

  const handleStartLevel = (level: Level) => {
    track('progression_started', { levelId: level.id })
    actions.setSelectedLevel(level.id)
    setSessionLevel(level)
    setSessionOpen(true)
    setSessionCountdown(5)
  }

  const handleAddToPlan = (level: Level) => {
    setPlannerOpen(true)
    actions.setSelectedLevel(level.id)
    toast({
      title: `Planning Level ${level.number}`,
      description: 'Lock it into your weekly cycle.',
    })
  }

  const handlePinToWeek = (level: Level | null) => {
    if (!level) {
      return
    }
    const nextDay = (['mon', 'wed', 'fri'] as const).find((day) => !weeklyPlan[day]) ?? 'mon'
    actions
      .saveWeeklyPlan({
        ...weeklyPlan,
        [nextDay]: level.id,
      })
      .then(() => {
        toast({
          title: `Pinned to ${nextDay.toUpperCase()}`,
          description: `Level ${level.number} will headline your ${nextDay === 'mon' ? 'Monday' : nextDay === 'wed' ? 'Wednesday' : 'Friday'} session.`,
        })
      })
  }

  const milestoneInfo = useMemo(() => {
    const baseLevel = selectedLevel ?? continueLevel
    if (!baseLevel) {
      return { level: null, remaining: null }
    }
    const next = MILESTONES.find((milestone) => milestone > baseLevel.number) ?? null
    return {
      level: next,
      remaining: next ? next - baseLevel.number : null,
    }
  }, [selectedLevel, continueLevel])

  const timeRemainingMinutes = useMemo(() => {
    const completed = progress?.completedCount ?? 0
    const baseline = 180
    const deduction = completed * 6
    return Math.max(30, baseline - deduction)
  }, [progress])

  const arcLabel = useMemo(() => {
    const world = worlds.find((entry) => entry.id === selectedWorldId)
    return world ? `${world.title} · Lv ${world.range[0]}-${world.range[1]}` : 'Arc progress'
  }, [worlds, selectedWorldId])

  const arcPercent = progress?.arcPercent[selectedWorldId] ?? 0

  const layoutClass = isDesktop
    ? 'grid-cols-[260px_minmax(0,1fr)_320px]'
    : isTablet
      ? 'grid-cols-[240px_minmax(0,1fr)]'
      : 'grid-cols-1'

  return (
    <>
      <div className="space-y-6">
        <ContinueCard
          level={continueLevel}
          progress={progress}
          milestoneLevelNumber={milestoneInfo.level}
          milestoneLevelsRemaining={milestoneInfo.remaining}
          timeRemainingMinutes={timeRemainingMinutes}
          onStart={handleStartLevel}
        />

        {error ? (
          <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
            {error}. <button onClick={() => actions.load()} className="underline">Retry</button>
          </div>
        ) : null}

        <div className={`grid gap-6 ${layoutClass}`}>
          <aside className="space-y-6">
            <WorldArcTabs
              worlds={worlds}
              selectedWorldId={selectedWorldId}
              onValueChange={(value) => {
                actions.setSelectedWorld(value)
                const nextLevel =
                  allLevels.find((level) => level.worldId === value && level.status !== 'locked') ??
                  allLevels.find((level) => level.worldId === value)
                actions.setSelectedLevel(nextLevel?.id ?? null)
                if (nextLevel) {
                  router.replace(`/progression/${value}/${nextLevel.id}`, { scroll: false })
                } else {
                  router.replace(`/progression/${value}`, { scroll: false })
                }
              }}
              arcPercent={progress?.arcPercent}
              orientation={isDesktop ? 'vertical' : 'horizontal'}
            />
            {!isDesktop ? (
              <MomentumPanel arcLabel={arcLabel} arcPercent={arcPercent} nudges={nudges} />
            ) : null}
          </aside>

          <section className="flex flex-col">
            {loading ? (
              <GridSkeleton />
            ) : (
              <LevelGrid
                levels={filteredLevels}
                query={filters.query}
                difficultyFilter={filters.difficulty}
                statusFilter={filters.status}
                resultCount={resultCount}
                selectedLevelId={selectedLevel?.id ?? null}
                onQueryChange={actions.setQuery}
                onToggleDifficulty={actions.toggleDifficulty}
                onToggleStatus={actions.toggleStatus}
                onClearFilters={actions.clearFilters}
                onSelectLevel={(level) => {
                  actions.setSelectedLevel(level.id)
                  router.replace(`/progression/${level.worldId}/${level.id}`, { scroll: false })
                }}
                loading={loading}
              />
            )}
            {!isDesktop && (
              <LevelDetailsDrawer
                level={selectedLevel}
                open={Boolean(selectedLevel)}
                onOpenChange={(open) => {
                  if (!open) {
                    actions.setSelectedLevel(null)
                  }
                }}
                onStart={handleStartLevel}
                onAddToPlan={handleAddToPlan}
              />
            )}
          </section>

          {isDesktop ? (
            <aside className="flex flex-col gap-4">
              {loading ? (
                <DetailsSkeleton />
              ) : (
                <LevelDetails
                  level={selectedLevel ?? continueLevel}
                  onStart={handleStartLevel}
                  onAddToPlan={handleAddToPlan}
                  onShare={(level) => {
                    navigator.clipboard
                      ?.writeText(`${window.location.origin}/progression/${level.worldId}/${level.id}`)
                      .then(() =>
                        toast({
                          title: 'Copied link',
                          description: 'Share this level with your squad.',
                        }),
                      )
                  }}
                />
              )}
              <MomentumPanel arcLabel={arcLabel} arcPercent={arcPercent} nudges={nudges} />
            </aside>
          ) : null}
        </div>
      </div>

      <PlannerDialog open={plannerOpen} onOpenChange={setPlannerOpen} worldId={selectedWorldId} />

      <SessionDialog
        open={sessionOpen}
        countdown={sessionCountdown}
        level={sessionLevel}
        onOpenChange={setSessionOpen}
        onDone={() => setSessionCountdown(0)}
      />

      <StickyActions
        level={selectedLevel ?? continueLevel}
        onStart={handleStartLevel}
        onAddToPlan={handleAddToPlan}
        onPinToWeek={handlePinToWeek}
      />
    </>
  )
}

interface StickyActionsProps {
  level: Level | null
  onStart: (level: Level) => void
  onAddToPlan: (level: Level) => void
  onPinToWeek: (level: Level | null) => void
}

function StickyActions({ level, onStart, onAddToPlan, onPinToWeek }: StickyActionsProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  if (!level) return null
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:px-6"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-3 rounded-full border border-white/10 bg-background/95 px-4 py-3 shadow-[0_20px_45px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <Badge variant="secondary" className="hidden rounded-full bg-sport-blue/15 text-xs font-semibold text-sport-blue sm:inline-flex">
          Level {level.number}
        </Badge>
        <span className="flex-1 truncate text-sm font-semibold text-foreground sm:text-base">
          {level.title}
        </span>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            onClick={() => onAddToPlan(level)}
            variant="ghost"
            size={isMobile ? 'sm' : 'default'}
            className="rounded-full text-sm"
            aria-label="Add to weekly plan"
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            {!isMobile && 'Add to plan'}
          </Button>
          <Button
            onClick={() => onPinToWeek(level)}
            variant="outline"
            size={isMobile ? 'sm' : 'default'}
            className="rounded-full text-sm"
            aria-label="Pin level to week"
          >
            <BookmarkPlus className="mr-2 h-4 w-4" />
            {!isMobile && 'Pin to week'}
          </Button>
          <Button
            onClick={() => onStart(level)}
            className="gap-2 rounded-full bg-gradient-to-r from-sport-blue to-sport-green text-white shadow-[0_20px_45px_rgba(59,130,246,0.4)]"
            aria-label="Start level"
          >
            <Play className="h-4 w-4" />
            {!isMobile && 'Start'}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface SessionDialogProps {
  open: boolean
  countdown: number
  level: Level | null
  onOpenChange: (open: boolean) => void
  onDone: () => void
}

function SessionDialog({ open, countdown, level, onOpenChange, onDone }: SessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border border-white/10 bg-background/95 p-6 text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">
            {level ? `Level ${level.number} in session` : 'Level in session'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Press done when you complete the drills. This will mark the level as complete and advance your streak.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4 bg-white/10" />
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl font-bold text-sport-blue">{countdown}</span>
          <p className="text-sm text-muted-foreground">Countdown to check-in</p>
          <Button onClick={onDone} className="rounded-full px-6">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface LevelDetailsDrawerProps {
  level: Level | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStart: (level: Level) => void
  onAddToPlan: (level: Level) => void
}

function LevelDetailsDrawer({ level, open, onOpenChange, onStart, onAddToPlan }: LevelDetailsDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg translate-y-0 rounded-t-3xl border border-white/10 bg-background/95 p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {level ? `Level ${level.number}` : 'Select a level'}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <LevelDetails
            level={level}
            onStart={onStart}
            onAddToPlan={onAddToPlan}
            onShare={(lvl) =>
              navigator.clipboard?.writeText(`${window.location.origin}/progression/${lvl.worldId}/${lvl.id}`)
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
