'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, Target, Shield, Calendar as CalendarIcon, TrendingUp, Share2, Trophy, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ActivityDay {
  date: string
  completed: boolean
  sports?: string[]
}

interface StreakFreeze {
  id: string
  freezeType: 'earned' | 'purchased' | 'granted'
  status: 'available' | 'used' | 'expired'
  expiresAt?: string | null
  earnedAt: string
}

interface FriendStreak {
  id: string
  name: string
  avatar: string
  streak: number
}

interface EnhancedStreakWidgetProps {
  streakData: {
    currentStreak: number
    bestStreak: number
    weeklyGoal: number
    weeklyProgress: number
    todayCompleted: boolean
    totalDaysActive?: number
    activityCalendar?: ActivityDay[]
  }
  freezes?: StreakFreeze[]
  friendStreaks?: FriendStreak[]
  sportName?: string
  onViewDetails?: () => void
  onShare?: () => void
  className?: string
}

export function EnhancedStreakWidget({
  streakData,
  freezes = [],
  friendStreaks = [],
  sportName = 'All Sports',
  onViewDetails,
  onShare,
  className,
}: EnhancedStreakWidgetProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [calendarDays, setCalendarDays] = useState<Array<ActivityDay | null>>([])
  const [showMilestone, setShowMilestone] = useState(false)
  const [celebrateCompletion, setCelebrateCompletion] = useState(false)

  // Milestone detection
  const milestones = [7, 14, 30, 60, 100, 180, 365]
  const currentMilestone = milestones.find(m => streakData.currentStreak === m)
  const nextMilestone = milestones.find(m => m > streakData.currentStreak) || null

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress((streakData.weeklyProgress / streakData.weeklyGoal) * 100)
    }, 200)
    return () => clearTimeout(timer)
  }, [streakData.weeklyProgress, streakData.weeklyGoal])

  // Celebrate milestone
  useEffect(() => {
    if (currentMilestone) {
      setShowMilestone(true)
      const timer = setTimeout(() => setShowMilestone(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [currentMilestone])

  // Celebrate daily completion
  useEffect(() => {
    if (streakData.todayCompleted) {
      setCelebrateCompletion(true)
      const timer = setTimeout(() => setCelebrateCompletion(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [streakData.todayCompleted])

  useEffect(() => {
    // Generate 12-week calendar (84 days)
    const today = new Date()
    const days: Array<ActivityDay | null> = []
    const activityMap = new Map(
      (streakData.activityCalendar || []).map((day) => [day.date, day])
    )

    for (let i = 83; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]

      const activity = activityMap.get(dateString)
      days.push(
        activity || {
          date: dateString,
          completed: false,
        }
      )
    }

    setCalendarDays(days)
  }, [streakData.activityCalendar])

  const availableFreezes = freezes.filter((f) => f.status === 'available')
  const daysUntilNextFreeze = 7 - (streakData.currentStreak % 7)

  const getMilestoneEmoji = (days: number) => {
    if (days >= 365) return '🏆'
    if (days >= 180) return '💎'
    if (days >= 100) return '🔥'
    if (days >= 60) return '⚡'
    if (days >= 30) return '🌟'
    if (days >= 14) return '✨'
    if (days >= 7) return '🎉'
    return '🔥'
  }

  return (
    <Card className={cn('relative overflow-hidden border-border/40 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm shadow-lg transition-all duration-500', className)}>
      {/* Milestone Celebration Overlay */}
      {showMilestone && currentMilestone && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="text-center space-y-3 animate-in zoom-in-95 duration-700">
            <div className="text-6xl animate-bounce">{getMilestoneEmoji(currentMilestone)}</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{currentMilestone} Day Streak!</h3>
              <p className="text-sm text-white/80 mt-1">Incredible dedication!</p>
            </div>
          </div>
        </div>
      )}

      {/* Confetti effect on completion */}
      {celebrateCompletion && (
        <div className="pointer-events-none absolute inset-0 z-40">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 animate-ping rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#22c55e', '#3b82f6', '#f97316'][Math.floor(Math.random() * 3)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      <CardHeader className="relative pb-3 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-foreground">
            <div className={cn(
              "p-2 rounded-xl bg-gradient-to-br from-sport-orange/20 to-sport-orange/5 transition-transform duration-300",
              celebrateCompletion && "animate-bounce scale-110"
            )}>
              <Flame className="h-5 w-5 text-sport-orange" />
            </div>
            Training streak
          </CardTitle>
          <div className="flex items-center gap-2">
            {onShare && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 rounded-xl p-0 hover:bg-sport-blue/10 transition-all"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4 text-sport-blue" />
              </Button>
            )}
            {availableFreezes.length > 0 && (
              <Badge variant="secondary" className="rounded-lg bg-gradient-to-r from-sport-blue/15 to-sport-blue/5 text-xs font-semibold text-sport-blue px-3 border border-sport-blue/20">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                {availableFreezes.length}
              </Badge>
            )}
            {streakData.todayCompleted && (
              <Badge variant="secondary" className={cn(
                "rounded-lg bg-gradient-to-r from-sport-green/15 to-sport-green/5 text-xs font-semibold text-sport-green px-3 border border-sport-green/20 transition-all duration-300",
                celebrateCompletion && "scale-110 shadow-lg"
              )}>
                Today ✓
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6 pt-5">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 bg-gradient-to-br from-sport-orange/10 via-sport-orange/5 to-transparent rounded-2xl border border-sport-orange/20 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium uppercase tracking-wider text-sport-orange/70">Current streak</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold text-sport-orange tracking-tight">{streakData.currentStreak}</p>
                  <span className="text-lg font-medium text-muted-foreground mb-1">days</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-sport-orange/10">
                <Flame className="h-6 w-6 text-sport-orange" />
              </div>
            </div>
          </div>

          <StatTile
            label="Personal best"
            value={streakData.bestStreak}
            suffix="days"
            icon={<TrendingUp className="h-5 w-5 text-sport-blue" />}
            gradient="from-sport-blue/10 to-transparent"
            borderColor="border-sport-blue/20"
            iconBg="bg-sport-blue/10"
          />
          <StatTile
            label="Total active"
            value={streakData.totalDaysActive || 0}
            suffix="days"
            icon={<CalendarIcon className="h-5 w-5 text-sport-green" />}
            gradient="from-sport-green/10 to-transparent"
            borderColor="border-sport-green/20"
            iconBg="bg-sport-green/10"
          />
        </div>

        {/* Weekly Goal Progress */}
        <div className="space-y-4 rounded-2xl border border-border/40 bg-gradient-to-br from-muted/30 to-transparent p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-foreground/5">
                <Target className="h-4 w-4 text-foreground/70" />
              </div>
              <span className="text-sm font-semibold text-foreground">Weekly goal</span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-sport-blue">{streakData.weeklyProgress}</span>
              <span className="text-muted-foreground">/{streakData.weeklyGoal}</span>
            </span>
          </div>

          <div className="space-y-2">
            <Progress value={animatedProgress} className="h-2.5 bg-muted/50" />
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all",
                      i < streakData.weeklyProgress
                        ? "bg-sport-blue text-white shadow-sm"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Consistency</p>
                <p className="text-sm font-bold text-foreground">{Math.min(100, Math.round(animatedProgress || 0))}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="space-y-3 rounded-2xl border border-border/40 bg-gradient-to-br from-muted/30 to-transparent p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground/80">Last 12 weeks</p>
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-md bg-muted border border-border/20" />
                <div className="h-3 w-3 rounded-md bg-sport-green/30 border border-sport-green/20" />
                <div className="h-3 w-3 rounded-md bg-sport-green/60 border border-sport-green/30" />
                <div className="h-3 w-3 rounded-md bg-sport-green border border-sport-green/40" />
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <TooltipProvider>
            <div className="grid grid-cols-12 gap-1.5">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-4 w-4" />
                }

                const intensity = day.completed ? (day.sports?.length || 1) : 0
                const bgColor =
                  intensity === 0
                    ? 'bg-muted/80 border-border/20'
                    : intensity === 1
                      ? 'bg-sport-green/30 border-sport-green/30'
                      : intensity === 2
                        ? 'bg-sport-green/60 border-sport-green/40'
                        : 'bg-sport-green border-sport-green/50'

                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'h-4 w-4 rounded-md border transition-all hover:scale-110 hover:shadow-sm cursor-pointer',
                          bgColor
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-semibold">{new Date(day.date).toLocaleDateString()}</p>
                      {day.completed ? (
                        <p className="text-sport-green">
                          ✓ {day.sports?.length || 1} {day.sports?.length === 1 ? 'sport' : 'sports'}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">No activity</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </TooltipProvider>
        </div>

        {/* Freeze Info */}
        {availableFreezes.length > 0 && (
          <div className="rounded-2xl border border-sport-blue/30 bg-gradient-to-br from-sport-blue/10 to-sport-blue/5 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sport-blue/20">
                <Shield className="h-4 w-4 text-sport-blue" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-foreground">Streak Protection Active</p>
                <p className="text-xs text-muted-foreground">
                  {availableFreezes.length} {availableFreezes.length === 1 ? 'freeze' : 'freezes'} will auto-save your streak
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Freeze Progress */}
        {streakData.currentStreak > 0 && daysUntilNextFreeze <= 7 && (
          <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-muted/30 to-transparent p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sport-orange/10">
                <Target className="h-4 w-4 text-sport-orange" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {daysUntilNextFreeze} {daysUntilNextFreeze === 1 ? 'day' : 'days'} until next freeze
                </p>
                <p className="text-xs text-muted-foreground">Complete a 7-day streak to earn protection</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Milestone Progress */}
        {nextMilestone && (
          <div className="rounded-2xl border border-dashed border-sport-orange/40 bg-gradient-to-br from-sport-orange/10 via-sport-orange/5 to-transparent p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sport-orange/15">
                <Trophy className="h-5 w-5 text-sport-orange" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {nextMilestone}-day milestone
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {nextMilestone - streakData.currentStreak} days to go
                    </p>
                  </div>
                  <span className="text-2xl">{getMilestoneEmoji(nextMilestone)}</span>
                </div>
                <Progress
                  value={(streakData.currentStreak / nextMilestone) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Friends Comparison */}
        {friendStreaks.length > 0 && (
          <div className="space-y-3 rounded-2xl border border-border/40 bg-gradient-to-br from-muted/30 to-transparent p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sport-blue/10">
                <Sparkles className="h-4 w-4 text-sport-blue" />
              </div>
              <p className="text-sm font-semibold text-foreground">Friends' streaks</p>
            </div>
            <div className="space-y-2">
              {friendStreaks.slice(0, 3).map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg bg-card/50 hover:bg-card transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sport-blue to-sport-green shadow-sm" />
                    <span className="text-sm font-medium text-foreground">{friend.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-sport-orange">
                    <Flame className="h-4 w-4" />
                    <span className="text-sm">{friend.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Details Button */}
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl border-border/40 bg-gradient-to-r from-muted/20 to-transparent text-foreground font-semibold transition-all hover:border-sport-blue/50 hover:bg-sport-blue/10 hover:shadow-md"
            onClick={onViewDetails}
          >
            View Detailed Stats
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function StatTile({
  label,
  value,
  suffix,
  emphasis,
  icon,
  gradient,
  borderColor,
  iconBg,
}: {
  label: string
  value: number
  suffix?: string
  emphasis?: string
  icon?: React.ReactNode
  gradient?: string
  borderColor?: string
  iconBg?: string
}) {
  return (
    <div className={cn(
      "rounded-2xl border p-5 shadow-sm bg-gradient-to-br",
      gradient || "from-muted/20 to-transparent",
      borderColor || "border-border/60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">{label}</p>
        {icon && (
          <div className={cn("p-2 rounded-lg", iconBg || "bg-foreground/5")}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className={cn('text-3xl font-bold text-foreground tracking-tight', emphasis)}>{value}</p>
        {suffix && <span className="text-sm font-medium text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  )
}
