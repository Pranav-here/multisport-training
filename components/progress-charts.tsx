"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Calendar, Trophy, TrendingUp, Target } from "lucide-react"
import type { ProgressData } from "@/lib/drill-data"

interface ProgressChartsProps {
  progressData: ProgressData
}

export function ProgressCharts({ progressData }: ProgressChartsProps) {
  const xpProgress = (progressData.xp / progressData.totalXp) * 100

  return (
    <div className="space-y-6">
      {/* XP and Level Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-sport-orange" />
              <span>Level Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-sport-blue">Level {progressData.level}</div>
              <div className="text-sm text-muted-foreground">
                {progressData.xpToNextLevel} XP to Level {progressData.level + 1}
              </div>
            </div>
            <Progress value={xpProgress} className="h-3" />
            <div className="text-center text-sm text-muted-foreground">
              {progressData.xp.toLocaleString()} / {progressData.totalXp.toLocaleString()} XP
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-sport-green" />
              <span>Recent Badges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressData.badges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center space-x-3">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.earnedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak Calendar Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-sport-blue" />
            <span>Training Streak</span>
          </CardTitle>
          <CardDescription>Your training activity over the past weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-xs text-center text-muted-foreground p-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {progressData.streakCalendar.slice(0, 35).map((day, index) => (
              <div
                key={index}
                className={`aspect-square rounded-sm border ${
                  day.completed ? "bg-sport-green border-sport-green" : "bg-muted border-border hover:bg-muted/80"
                }`}
                title={`${day.date}: ${day.completed ? "Completed" : "No activity"}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-sm bg-muted border"></div>
              <div className="w-3 h-3 rounded-sm bg-sport-green/30 border-sport-green/30"></div>
              <div className="w-3 h-3 rounded-sm bg-sport-green/60 border-sport-green/60"></div>
              <div className="w-3 h-3 rounded-sm bg-sport-green border-sport-green"></div>
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-sport-orange" />
            <span>Recent Sessions</span>
          </CardTitle>
          <CardDescription>XP earned from your last 7 training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData.recentSessions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="hsl(var(--sport-blue))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--sport-blue))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--sport-blue))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Skill Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-sport-green" />
            <span>Skill Assessment</span>
          </CardTitle>
          <CardDescription>Your current skill levels across different areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={progressData.skillRadar}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="skill" className="text-xs" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Skill Level"
                  dataKey="value"
                  stroke="hsl(var(--sport-green))"
                  fill="hsl(var(--sport-green))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {progressData.skillRadar.map((skill) => (
              <div key={skill.skill} className="text-center">
                <div className="text-sm font-medium">{skill.skill}</div>
                <div className="text-2xl font-bold text-sport-green">{skill.value}</div>
                <div className="text-xs text-muted-foreground">/ {skill.maxValue}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
