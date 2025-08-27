"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/leaderboard-data"

interface LeaderboardEntryProps {
  entry: LeaderboardEntry
  showSport?: boolean
}

export function LeaderboardEntryCard({ entry, showSport = true }: LeaderboardEntryProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-br from-amber-500 to-amber-700 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  const getChangeText = (change: number) => {
    if (change > 0) return `+${change}`
    return change.toString()
  }

  return (
    <Card className={`transition-all hover:shadow-md ${entry.isCurrentUser ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Rank */}
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(entry.rank)}`}
          >
            {entry.rank}
          </div>

          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={entry.userAvatar || "/placeholder.svg"} alt={entry.userName} />
            <AvatarFallback>
              {entry.userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold truncate">{entry.userName}</h3>
              {entry.isCurrentUser && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="truncate">{entry.school}</span>
              <span>•</span>
              <span className="truncate">{entry.location}</span>
            </div>
            {showSport && entry.sport !== "Multi-Sport" && (
              <Badge variant="outline" className="text-xs mt-1">
                {entry.sport}
              </Badge>
            )}
          </div>

          {/* Score and Change */}
          <div className="text-right">
            <div className="text-lg font-bold text-sport-blue">{entry.score.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              {getChangeIcon(entry.change)}
              <span
                className={
                  entry.change > 0 ? "text-green-500" : entry.change < 0 ? "text-red-500" : "text-muted-foreground"
                }
              >
                {getChangeText(entry.change)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
