'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Hash, Clock, TrendingUp, Users, Flame, Award, ChevronRight, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface TrendingPost {
  id: string
  thumbnail: string
  userName: string
  userAvatar: string
  likes: number
}

interface DailyHashtagChallengeProps {
  hashtag: {
    id: string
    tag: string
    displayName: string
    description: string
    endAt: string
    participantCount?: number
    todayParticipantCount?: number
    trendingPosts?: TrendingPost[]
    userParticipated?: boolean
  }
  onQuickPost?: () => void
  onViewDetails?: () => void
  className?: string
}

export function DailyHashtagChallenge({
  hashtag,
  onQuickPost,
  onViewDetails,
  className
}: DailyHashtagChallengeProps) {
  const router = useRouter()
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [pulseParticipants, setPulseParticipants] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const end = new Date(hashtag.endAt)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Expired')
        setIsExpired(true)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 24) {
        const days = Math.floor(hours / 24)
        setTimeRemaining(`${days}d ${hours % 24}h`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [hashtag.endAt])

  // Pulse animation for participant count
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseParticipants(true)
      setTimeout(() => setPulseParticipants(false), 500)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const formattedTag = hashtag.tag.replace(/([a-z])([A-Z])/g, '$1\u200B$2')
  const participantCount = hashtag.todayParticipantCount || hashtag.participantCount || 0
  const trendingPosts = hashtag.trendingPosts || []
  const hasParticipated = hashtag.userParticipated || false

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border/60 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
        className
      )}
    >
      {/* Animated background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sport-blue/10 via-sport-orange/5 to-sport-green/10 opacity-60 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Subtle animated border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-sport-blue/20 via-sport-orange/20 to-sport-green/20 blur-xl" />
      </div>

      <CardHeader className="relative z-10 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sport-blue to-sport-orange">
                <Hash className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">Today's Challenge</h3>
                <Badge
                  variant="secondary"
                  className="mt-0.5 rounded-full bg-gradient-to-r from-sport-blue/20 to-sport-orange/20 px-3 py-0.5 text-sm font-bold text-foreground"
                >
                  {formattedTag}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{hashtag.description}</p>
          </div>

          {/* Countdown Badge */}
          <div className={cn(
            "flex flex-col items-end gap-1",
            isExpired && "opacity-50"
          )}>
            <div className="flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-sport-orange" />
              <span className="text-foreground">{timeRemaining}</span>
            </div>
            {hasParticipated && (
              <Badge variant="secondary" className="rounded-full bg-sport-green/15 text-xs font-medium text-sport-green">
                ✓ Joined
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Live Stats */}
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl border border-border/60 bg-muted/20 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sport-blue/10">
                <Users className={cn(
                  "h-4 w-4 text-sport-blue transition-transform duration-300",
                  pulseParticipants && "scale-125"
                )} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Participating</p>
                <p className={cn(
                  "text-lg font-bold text-foreground transition-all duration-300",
                  pulseParticipants && "scale-110 text-sport-blue"
                )}>
                  {participantCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 rounded-xl border border-border/60 bg-muted/20 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sport-orange/10">
                <Flame className="h-4 w-4 text-sport-orange" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Streak Boost</p>
                <p className="text-lg font-bold text-sport-orange">+2x</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Posts Preview */}
        {trendingPosts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-sport-green" />
              <p className="text-xs font-medium text-muted-foreground">Top posts today</p>
            </div>
            <div className="flex gap-2">
              {trendingPosts.slice(0, 3).map((post, index) => (
                <button
                  key={post.id}
                  onClick={() => router.push(`/hashtag/${hashtag.id}`)}
                  className="group/post relative flex-1 overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div className="aspect-square w-full">
                    <img
                      src={post.thumbnail}
                      alt={`Post by ${post.userName}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/post:scale-110"
                    />
                  </div>
                  {/* Overlay with user info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/post:opacity-100">
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5 border border-white/20">
                          <AvatarImage src={post.userAvatar} alt={post.userName} />
                          <AvatarFallback className="text-[8px]">{post.userName[0]}</AvatarFallback>
                        </Avatar>
                        <p className="text-[10px] font-medium text-white truncate">{post.userName}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] text-white/80">❤️ {post.likes}</p>
                    </div>
                  </div>
                  {/* Rank badge */}
                  {index === 0 && (
                    <div className="absolute right-1 top-1 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onQuickPost && (
            <Button
              size="sm"
              className="flex-1 rounded-full bg-gradient-to-r from-sport-green to-sport-blue text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              onClick={onQuickPost}
              disabled={isExpired}
            >
              <Zap className="mr-1.5 h-4 w-4" />
              Quick Post
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-full border-border/60 bg-muted/20 text-foreground transition-all duration-300 hover:border-sport-blue/60 hover:bg-sport-blue/10 hover:scale-105"
            onClick={() => {
              if (onViewDetails) {
                onViewDetails()
              } else {
                router.push(`/hashtag/${hashtag.id}`)
              }
            }}
          >
            <TrendingUp className="mr-1.5 h-4 w-4" />
            View Leaderboard
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Rewards Preview */}
        {!hasParticipated && !isExpired && (
          <div className="rounded-lg border border-dashed border-sport-orange/40 bg-sport-orange/5 p-2.5">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-sport-orange" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-sport-orange">+50 pts</span> • Complete to earn streak bonus
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
