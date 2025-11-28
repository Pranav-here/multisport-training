'use client'

import Link from 'next/link'

import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Nudge } from '@/lib/progression/types'

interface MomentumPanelProps {
  arcLabel: string
  arcPercent: number
  nudges: Nudge[]
}

export function MomentumPanel({ arcLabel, arcPercent, nudges }: MomentumPanelProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Current arc</p>
        <h3 className="text-lg font-semibold text-foreground">{arcLabel}</h3>
        <Progress
          value={Math.round(arcPercent * 100)}
          className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"
        />
        <p className="text-sm text-muted-foreground">
          {Math.round(arcPercent * 100)}% complete · keep the tempo to unlock the next milestone badge.
        </p>
      </header>

      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Momentum nudges</p>
        <div className="space-y-3">
          {nudges.map((nudge) => (
            <NudgeCard key={nudge.id} nudge={nudge} />
          ))}
        </div>
      </section>
    </div>
  )
}

interface NudgeCardProps {
  nudge: Nudge
}

function NudgeCard({ nudge }: NudgeCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">{nudge.title}</h4>
        <p className="text-sm text-muted-foreground">{nudge.description}</p>
      </div>
      <Button variant="outline" size="sm" className={cn('w-fit rounded-full border-white/20 text-xs')} asChild>
        <Link href={nudge.href} aria-label={nudge.actionLabel}>
          {nudge.actionLabel}
        </Link>
      </Button>
    </article>
  )
}
