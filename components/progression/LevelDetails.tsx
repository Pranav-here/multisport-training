'use client'

import { useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { motion } from 'framer-motion'
import { BadgeCheck, ChevronDown, Clock, ListChecks, Lock, Medal, Play, Plus, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Level } from '@/lib/progression/types'

interface LevelDetailsProps {
  level: Level | null
  onStart: (level: Level) => void
  onAddToPlan: (level: Level) => void
  onShare: (level: Level) => void
}

export function LevelDetails({ level, onStart, onAddToPlan, onShare }: LevelDetailsProps) {
  const [openNotes, setOpenNotes] = useState(false)

  if (!level) {
    return (
      <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-muted-foreground">
        Select any tile to view objectives, rewards, and coach notes.
      </div>
    )
  }

  const isLocked = level.status === 'locked'

  return (
    <motion.div
      key={level.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex h-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full bg-sport-blue/15 text-xs font-semibold text-sport-blue">
            Level {level.number}
          </Badge>
          <Badge variant="outline" className="rounded-full border-white/20 bg-white/5 text-xs uppercase tracking-[0.3em]">
            Difficulty {level.difficulty}
          </Badge>
          {level.status === 'complete' ? (
            <Badge variant="outline" className="rounded-full border-emerald-400/40 bg-emerald-500/15 text-xs text-emerald-300">
              <BadgeCheck className="mr-1 h-3 w-3" />
              Complete
            </Badge>
          ) : level.status === 'locked' ? (
            <Badge variant="outline" className="rounded-full border-white/20 bg-white/5 text-xs text-muted-foreground">
              <Lock className="mr-1 h-3 w-3" />
              Locked
            </Badge>
          ) : null}
        </div>
        <h2 className="text-2xl font-semibold text-foreground">{level.title}</h2>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-sport-green" />
          Estimated {level.estMinutes} minutes · {level.objectives.length} objectives
        </p>
      </header>

      {level.media ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50">
          <video
            src={level.media.url}
            poster={level.media.poster}
            controls
            preload="metadata"
            className="h-56 w-full rounded-2xl object-cover"
          />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-sm text-muted-foreground">
          Drop a video or image preview to inspire the squad.
        </div>
      )}

      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <ListChecks className="h-4 w-4 text-sport-blue" />
          Objectives
        </h3>
        <ul className="mt-3 space-y-3">
          {level.objectives.map((objective, index) => (
            <li key={index} className="flex gap-3 text-sm text-foreground">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sport-blue" aria-hidden="true" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-sport-blue/30 bg-sport-blue/15 p-4 text-sm text-slate-100">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-sport-blue/90">
          <Medal className="h-4 w-4" />
          Reward
        </p>
        <p className="mt-2 font-medium">
          Milestones unlock badges and analytics packs. Stack this run to unlock the next analyser bundle.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => onStart(level)}
          disabled={isLocked}
          className="gap-2 rounded-full bg-gradient-to-r from-sport-blue to-sport-green px-6 text-sm font-semibold text-white hover:-translate-y-0.5"
          aria-label={isLocked ? 'Level locked' : `Start level ${level.number}`}
        >
          <Play className="h-4 w-4" />
          {level.status === 'in_progress' ? 'Resume level' : 'Start level'}
        </Button>
        <Button
          variant="outline"
          disabled={isLocked}
          className="gap-2 rounded-full border-white/20 bg-white/5 text-sm"
          onClick={() => onAddToPlan(level)}
        >
          <Plus className="h-4 w-4" />
          Add to weekly plan
        </Button>
        <Button
          variant="ghost"
          className="gap-2 rounded-full text-sm text-sport-blue hover:text-sport-blue/80"
          onClick={() => onShare(level)}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      <Collapsible.Root
        open={openNotes}
        onOpenChange={setOpenNotes}
        className="rounded-2xl border border-white/10 bg-white/5"
      >
        <Collapsible.Trigger className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          Coach notes
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', openNotes ? 'rotate-180' : 'rotate-0')}
            aria-hidden="true"
          />
        </Collapsible.Trigger>
        <Collapsible.Content className="px-4 pb-4 text-sm text-muted-foreground">
          {level.coachNotes ?? 'No additional coach notes yet. Drop a message after your next review.'}
        </Collapsible.Content>
      </Collapsible.Root>

      <Separator className="bg-white/10" />
      <footer className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {level.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em]">
            {tag}
          </span>
        ))}
      </footer>
    </motion.div>
  )
}
