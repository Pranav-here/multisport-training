"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Clock } from "lucide-react"
import type { Challenge } from "@/lib/mock-data"

interface DailyChallengeCardProps {
  challenge: Challenge
  onJoin?: () => void
}

export function DailyChallengeCard({ challenge, onJoin }: DailyChallengeCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-sport-blue/5 to-sport-green/5 border-sport-blue/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-sport-blue" />
            <CardTitle className="text-lg">Daily Challenge</CardTitle>
          </div>
          <Badge className={getDifficultyColor(challenge.difficulty)} variant="secondary">
            {challenge.difficulty}
          </Badge>
        </div>
        <CardDescription className="text-base font-medium text-foreground">{challenge.title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img
            src={challenge.thumbnail || "/placeholder.svg"}
            alt={challenge.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/daily-sports-challenge.png"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2 text-white text-sm font-medium">{challenge.sport}</div>
        </div>

        <p className="text-sm text-muted-foreground text-balance">{challenge.description}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{challenge.participants.toLocaleString()} joined</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{challenge.timeLeft} left</span>
            </div>
          </div>
          <div className="text-sport-blue font-semibold">+{challenge.points} pts</div>
        </div>

        <Button className="w-full" onClick={onJoin}>
          Join Challenge
        </Button>
      </CardContent>
    </Card>
  )
}
