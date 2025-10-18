"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Flame, Target } from "lucide-react"
import type { StreakData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface StreakWidgetProps {
  streakData: StreakData
  className?: string
  footerContent?: ReactNode
}

export function StreakWidget({ streakData, className, footerContent }: StreakWidgetProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress((streakData.weeklyProgress / streakData.weeklyGoal) * 100)
    }, 200)
    return () => clearTimeout(timer)
  }, [streakData.weeklyProgress, streakData.weeklyGoal])

  const todayIndex = new Date().getDay()

  return (
    <Card className={cn("overflow-hidden border-border/60 bg-card/95", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Flame className="h-5 w-5 text-sport-orange" />
            Training streak
          </CardTitle>
          {streakData.todayCompleted ? (
            <Badge variant="secondary" className="rounded-full bg-sport-green/15 text-xs font-medium text-sport-green">
              Logged today
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatTile label="Current streak" value={streakData.currentStreak} emphasis="text-sport-orange" />
          <StatTile label="Personal best" value={streakData.longestStreak} />
        </div>

        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center justify-between text-sm font-medium text-foreground">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              Weekly goal
            </span>
            <span>
              {streakData.weeklyProgress}/{streakData.weeklyGoal}
            </span>
          </div>
          <Progress value={animatedProgress} className="h-2" />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Consistency</span>
            <span>{Math.min(100, Math.round((animatedProgress || 0) ?? 0))}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 rounded-xl border border-border/60 bg-muted/20 p-3">
          {Array.from({ length: 7 }, (_, index) => {
            const isCompleted = index < streakData.weeklyProgress
            const isToday = index === todayIndex
            return (
              <div
                key={index}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium",
                  isCompleted
                    ? "bg-sport-green text-white"
                    : isToday
                      ? "border border-sport-blue/50 bg-background text-sport-blue"
                      : "bg-background text-muted-foreground",
                )}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
            )
          })}
        </div>
      </CardContent>
      {footerContent ? <CardFooter className="pt-0">{footerContent}</CardFooter> : null}
    </Card>
  )
}

function StatTile({ label, value, emphasis }: { label: string; value: number; emphasis?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold text-foreground", emphasis)}>{value}</p>
    </div>
  )
}
