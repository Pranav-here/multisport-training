"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar, ChevronRight } from "lucide-react"
import type { LeaderboardEntry, Badge as BadgeType, TeamSession } from "@/lib/mock-data"

interface SidebarWidgetsProps {
  leaderboard: LeaderboardEntry[]
  badges: BadgeType[]
  teamSessions: TeamSession[]
}

export function SidebarWidgets({ leaderboard, badges, teamSessions }: SidebarWidgetsProps) {
  return (
    <div className="space-y-6">
      {/* Mini Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-sport-orange" />
              <span>School Leaderboard</span>
            </CardTitle>
            <Link href="/leaderboards">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboard.slice(0, 3).map((entry) => (
            <div key={entry.userId} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    entry.rank === 1
                      ? "bg-yellow-500 text-white"
                      : entry.rank === 2
                        ? "bg-gray-400 text-white"
                        : entry.rank === 3
                          ? "bg-amber-600 text-white"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {entry.rank}
                </div>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.userAvatar || "/placeholder.svg"} alt={entry.userName} />
                <AvatarFallback className="text-xs">
                  {entry.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.userName}</p>
                <p className="text-xs text-muted-foreground">{entry.school}</p>
              </div>
              <div className="text-sm font-semibold text-sport-blue">{entry.score}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Team Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-sport-green" />
              <span>Team Sessions</span>
            </CardTitle>
            <Link href="/teams">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {teamSessions.slice(0, 2).map((session) => (
            <div key={session.id} className="p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{session.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {session.sport}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {session.date} at {session.time}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>
                    {session.participants}/{session.maxParticipants}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{session.location}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Badges */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-sport-blue" />
              <span>Recent Badges</span>
            </CardTitle>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {badges.map((badge) => (
            <div key={badge.id} className="flex items-center space-x-3">
              <div className="text-2xl">{badge.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                <p className="text-xs text-muted-foreground">{badge.earnedDate}</p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  badge.rarity === "legendary"
                    ? "border-yellow-500 text-yellow-600"
                    : badge.rarity === "epic"
                      ? "border-purple-500 text-purple-600"
                      : badge.rarity === "rare"
                        ? "border-blue-500 text-blue-600"
                        : "border-gray-500 text-gray-600"
                }`}
              >
                {badge.rarity}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
