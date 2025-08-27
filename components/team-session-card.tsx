"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, MapPin, Users, QrCode, Play, CheckCircle, Activity } from "lucide-react"
import type { TeamSession } from "@/lib/leaderboard-data"

interface TeamSessionCardProps {
  session: TeamSession
  onJoin?: (sessionId: string) => void
}

export function TeamSessionCard({ session, onJoin }: TeamSessionCardProps) {
  const [showQR, setShowQR] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Calendar className="h-4 w-4" />
      case "active":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const completionRate =
    (session.participants.filter((p) => p.status === "completed").length / session.participants.length) * 100

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline">{session.sport}</Badge>
              <Badge className={getStatusColor(session.status)} variant="secondary">
                {getStatusIcon(session.status)}
                <span className="ml-1 capitalize">{session.status}</span>
              </Badge>
            </div>
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <CardDescription>Created by {session.createdByName}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{session.date}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{session.time}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{session.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {session.participants.length}/{session.maxParticipants} joined
            </span>
          </div>
        </div>

        {/* Drills */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Drills:</p>
          <div className="flex flex-wrap gap-1">
            {session.drills.slice(0, 3).map((drill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {drill}
              </Badge>
            ))}
            {session.drills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{session.drills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Participants */}
        {session.participants.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Participants:</p>
            <div className="flex -space-x-2">
              {session.participants.slice(0, 5).map((participant) => (
                <Avatar key={participant.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                  <AvatarFallback className="text-xs">
                    {participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {session.participants.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{session.participants.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress for Active/Completed Sessions */}
        {(session.status === "active" || session.status === "completed") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        )}

        {/* Stats for Completed Sessions */}
        {session.status === "completed" && session.stats && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-sport-blue">{session.stats.averageScore}</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-sport-green">{session.stats.totalAttempts}</div>
              <div className="text-xs text-muted-foreground">Total Attempts</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          {session.status === "upcoming" && (
            <>
              <Button className="flex-1" onClick={() => onJoin?.(session.id)}>
                Join Session
              </Button>
              <Button variant="outline" size="icon" onClick={() => setShowQR(!showQR)}>
                <QrCode className="h-4 w-4" />
              </Button>
            </>
          )}
          {session.status === "active" && (
            <Link href={`/teams/${session.id}`} className="flex-1">
              <Button className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Join Active Session
              </Button>
            </Link>
          )}
          {session.status === "completed" && (
            <Link href={`/teams/${session.id}`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                View Results
              </Button>
            </Link>
          )}
        </div>

        {/* QR Code Display */}
        {showQR && (
          <div className="p-4 bg-white rounded-lg border text-center">
            <div className="h-32 w-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-2">
              <QrCode className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-sm font-medium">Group Code: {session.groupCode}</p>
            <p className="text-xs text-muted-foreground">Scan or enter code to join</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
