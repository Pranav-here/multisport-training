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
  currentUserId?: string
  profileEditHref?: string
}

export function SidebarWidgets({ leaderboard, badges, teamSessions, currentUserId, profileEditHref }: SidebarWidgetsProps) {
  const resolvedProfileHref = profileEditHref ?? '/profile'

  return (
    <div className="space-y-5">
      {/* Mini Leaderboard */}
      <Card className="rounded-2xl border border-border/60 bg-background/90 shadow-sm backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-sport-orange" />
            <span>School Leaderboard</span>
          </CardTitle>
          <Link href="/leaderboards">
            <Button variant="ghost" size="sm" className="gap-1 rounded-full px-3 hover:bg-sport-orange/10">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {leaderboard.slice(0, 3).map((entry) => {
            const isCurrentUser = entry.userId === currentUserId
            const displaySchool = entry.school?.trim()
              ? entry.school
              : isCurrentUser
                ? 'Add your details'
                : 'Not set'

            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-3 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                  isCurrentUser ? 'border-sport-blue/50 bg-sport-blue/10 shadow-sm' : ''
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                    entry.rank === 1
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500'
                      : entry.rank === 2
                        ? 'bg-gradient-to-br from-zinc-300 to-zinc-500'
                        : entry.rank === 3
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                          : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {entry.rank}
                </div>
                <Avatar className="h-9 w-9 ring-2 ring-background ring-offset-2 ring-offset-background/60">
                  <AvatarImage src={entry.userAvatar || '/placeholder.svg'} alt={entry.userName} />
                  <AvatarFallback className="text-xs">
                    {entry.userName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{entry.userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{displaySchool}</p>
                  {isCurrentUser && !entry.school?.trim() ? (
                    <Link href={resolvedProfileHref} className="text-xs font-medium text-sport-blue hover:underline">
                      Complete profile
                    </Link>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-sport-blue">{entry.score}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground/80">weekly pts</div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Upcoming Team Sessions */}
      <Card className="rounded-2xl border border-border/60 bg-background/90 shadow-sm backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-sport-green" />
            <span>Team Sessions</span>
          </CardTitle>
          <Link href="/teams">
            <Button variant="ghost" size="sm" className="gap-1 rounded-full px-3 hover:bg-sport-green/10">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamSessions.slice(0, 2).map((session) => (
            <div
              key={session.id}
              className="rounded-xl border border-border/40 bg-muted/30 p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">{session.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {session.sport}
                </Badge>
              </div>
              <div className="grid gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-sport-blue" />
                  <span>
                    {session.date} · {session.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-sport-green" />
                  <span>
                    {session.participants}/{session.maxParticipants} spots filled
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-muted-foreground/90">{session.location}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Badges */}
      <Card className="rounded-2xl border border-border/60 bg-background/90 shadow-sm backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-sport-blue" />
            <span>Recent Badges</span>
          </CardTitle>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-1 rounded-full px-3 hover:bg-sport-blue/10">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {badges.map((badge) => (
            <div key={badge.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sport-blue/10 text-xl">{badge.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">{badge.earnedDate}</p>
              </div>
              <Badge
                variant="outline"
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
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

