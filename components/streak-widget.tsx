"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Flame, Target } from "lucide-react"
import type { StreakData } from "@/lib/mock-data"

interface StreakWidgetProps {
  streakData: StreakData
}

export function StreakWidget({ streakData }: StreakWidgetProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress((streakData.weeklyProgress / streakData.weeklyGoal) * 100)
    }, 300)
    return () => clearTimeout(timer)
  }, [streakData.weeklyProgress, streakData.weeklyGoal])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Training Streak</span>
          </CardTitle>
          {streakData.todayCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Today ✓
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-sport-orange">{streakData.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{streakData.longestStreak}</div>
            <div className="text-xs text-muted-foreground">Personal Best</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-sport-blue" />
              <span>Weekly Goal</span>
            </div>
            <span className="font-medium">
              {streakData.weeklyProgress}/{streakData.weeklyGoal}
            </span>
          </div>
          <Progress value={animatedProgress} className="h-2" />
        </div>

        <div className="flex justify-center space-x-1">
          {Array.from({ length: 7 }, (_, i) => {
            const isCompleted = i < streakData.weeklyProgress
            const isToday = i === new Date().getDay()
            return (
              <div
                key={i}
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                  isCompleted
                    ? "bg-sport-green text-white"
                    : isToday
                      ? "bg-sport-blue/20 text-sport-blue border-2 border-sport-blue"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? "✓" : i + 1}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
