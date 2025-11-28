'use client'

import { useMemo, useState } from 'react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProgressionStore, selectWeeklyPlan, selectLevelsForWorld, selectSelectedLevel } from '@/lib/progression/store'
import type { WeeklyPlan } from '@/lib/progression/types'
import { track } from '@/lib/analytics'

interface PlannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  worldId: string
}

const days: Array<keyof WeeklyPlan> = ['mon', 'wed', 'fri']
const dayLabels: Record<keyof WeeklyPlan, string> = {
  mon: 'Monday',
  wed: 'Wednesday',
  fri: 'Friday',
}

export function PlannerDialog({ open, onOpenChange, worldId }: PlannerDialogProps) {
  const plan = useProgressionStore(selectWeeklyPlan)
  const levelsSelector = useMemo(() => selectLevelsForWorld(worldId), [worldId])
  const levels = useProgressionStore(levelsSelector)
  const selectedLevel = useProgressionStore(selectSelectedLevel)
  const saveWeeklyPlan = useProgressionStore((state) => state.actions.saveWeeklyPlan)
  const [pendingPlan, setPendingPlan] = useState<WeeklyPlan>(plan)
  const [saving, setSaving] = useState(false)

  const levelOptions = useMemo(
    () =>
      levels
        .filter((level) => level.status !== 'locked')
        .map((level) => ({
          value: level.id,
          label: `Lv ${level.number} · ${level.title}`,
        })),
    [levels],
  )

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPendingPlan((current) => ({
        mon: current.mon ?? selectedLevel?.id ?? plan.mon,
        wed: current.wed ?? plan.wed,
        fri: current.fri ?? plan.fri,
      }))
    }
    onOpenChange(next)
  }

  const handleSelect = (day: keyof WeeklyPlan, value: string) => {
    setPendingPlan((prev) => ({
      ...prev,
      [day]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveWeeklyPlan(pendingPlan)
      track('weekly_plan_saved', {
        levelIds: days.map((day) => pendingPlan[day]).filter(Boolean),
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl border border-white/10 bg-gradient-to-br from-background/95 via-background/90 to-sport-blue/10 p-0">
        <DialogHeader className="space-y-2 border-b border-white/10 px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-foreground">Lock your weekly cycle</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose three core levels for M · W · F. Edit anytime — your plan stays synced across devices.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {days.map((day) => (
              <div key={day} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{dayLabels[day]}</p>
                <Select
                  value={pendingPlan[day] ?? undefined}
                  onValueChange={(value) => handleSelect(day, value)}
                  aria-label={`Select level for ${dayLabels[day]}`}
                >
                  <SelectTrigger className="mt-2 rounded-xl border-white/20 bg-background/80 text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <SelectValue placeholder="Pick level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
