'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Plus, Hash } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { AuthGuard } from '@/components/auth-guard'
import { VideoCard } from '@/components/video-card'
import { DailyChallengeCard } from '@/components/daily-challenge-card'
import { StreakWidget } from '@/components/streak-widget'
import { SidebarWidgets } from '@/components/sidebar-widgets'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { getSupabaseBrowserClient, type SupabaseBrowserClient } from '@/lib/supabase-browser'
import {
  mockChallenge,
  mockLeaderboard,
  mockBadges,
  mockTeamSessions,
  mockPosts,
  getTodaysHashtag,
  type Post,
  type StreakData,
  type HashtagInfo,
  type LeaderboardEntry,
} from '@/lib/mock-data'

interface ClipApiResponse {
  id: string
  userId: string
  storagePath: string
  caption: string | null
  thumbnailUrl: string | null
  visibility: string
  createdAt: string
  durationSeconds: number | null
  width: number | null
  height: number | null
  sport: { id: number | null; slug: string | null; name: string | null } | null
  user: { id: string; displayName: string | null; username: string | null; avatarUrl: string | null }
  metrics: { likesCount: number; likedByUser: boolean; commentsCount: number }
}

interface LeaderboardApiEntry {
  userId: string
  score: number | null
  sport: { id: number | null; slug: string | null; name: string | null } | null
  user: { displayName: string | null; username: string | null; avatarUrl: string | null }
}

interface StreakRow {
  current_streak: number | null
  longest_streak: number | null
  last_activity_date: string | null
}

interface ApiErrorPayload {
  code: string
  message: string
  details?: unknown
}

type ApiResponse<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: ApiErrorPayload }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '') : ''
const clipsPublicBase = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public` : ''

function mapClipToPost(clip: ClipApiResponse): Post {
  const videoUrl = clip.storagePath ? `${clipsPublicBase}/clips/${clip.storagePath}` : ''
  const thumbnailUrl = clip.thumbnailUrl
    ? clip.thumbnailUrl.startsWith('http')
      ? clip.thumbnailUrl
      : `${clipsPublicBase}/clips/${clip.thumbnailUrl}`
    : videoUrl

  const durationSeconds = clip.durationSeconds ?? 0
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  const duration = durationSeconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : '0:15'

  return {
    id: clip.id,
    userId: clip.user.id,
    userName: clip.user.displayName ?? clip.user.username ?? 'Athlete',
    userAvatar: clip.user.avatarUrl ?? '/placeholder.svg',
    sport: clip.sport?.name ?? 'MultiSport',
    caption: clip.caption ?? '',
    tags: clip.sport?.slug ? [clip.sport.slug] : [],
    location: '',
    date: formatDistanceToNow(new Date(clip.createdAt), { addSuffix: true }),
    duration,
    thumbnail: thumbnailUrl,
    videoUrl,
    likes: clip.metrics.likesCount,
    comments: clip.metrics.commentsCount,
    shares: 0,
    isLiked: clip.metrics.likedByUser,
    isSaved: false,
  }
}

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  weeklyGoal: 5,
  weeklyProgress: 0,
  todayCompleted: false,
}

const skeletonFeed = Array.from({ length: 4 })

const createMockPosts = () =>
  mockPosts.map((post) => ({
    ...post,
    tags: [...post.tags],
  }))

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>(() => createMockPosts())
  const [postsLoading, setPostsLoading] = useState(false)
  const [streak, setStreak] = useState<StreakData>(defaultStreak)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const { toast } = useToast()
  const { session, user: authUser, profile } = useAuth()
  const profileUsername = profile?.username ?? ''
  const supabase = useMemo<SupabaseBrowserClient>(() => getSupabaseBrowserClient(), [])
  const hashtag = useMemo<HashtagInfo>(() => getTodaysHashtag(), [])

  const injectCurrentUser = useCallback((entries: LeaderboardEntry[]) => {
    if (!authUser) {
      return entries
    }

    const normalizedName = authUser.displayName
    const normalizedAvatar = authUser.avatarUrl ?? '/placeholder.svg'
    const usernameLabel = profileUsername ? `@${profileUsername}` : ''
    const existingIndex = entries.findIndex((entry) => entry.userId === authUser.id)

    if (existingIndex >= 0) {
      const current = entries[existingIndex]
      const needsUpdate =
        current.userName !== normalizedName ||
        current.userAvatar !== normalizedAvatar ||
        (usernameLabel && current.school !== usernameLabel)

      if (!needsUpdate) {
        return entries
      }

      return entries.map((entry, index) =>
        index === existingIndex
          ? {
              ...entry,
              userName: normalizedName,
              userAvatar: normalizedAvatar,
              school: usernameLabel || entry.school,
            }
          : entry,
      )
    }

    const newEntry: LeaderboardEntry = {
      rank: 1,
      userId: authUser.id,
      userName: normalizedName,
      userAvatar: normalizedAvatar,
      score: 0,
      school: usernameLabel,
      sport: 'MultiSport',
    }

    return [newEntry, ...entries].map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))
  }, [authUser, profileUsername])

  useEffect(() => {
    let cancelled = false

    const loadClips = async () => {
      if (!cancelled) {
        setPostsLoading(true)
      }

      try {
        const response = await fetch('/api/clips', { credentials: 'include' })
        const payload = (await response.json()) as ApiResponse<{ clips: ClipApiResponse[] }>
        if (!payload.ok) {
          throw new Error(payload.error.message)
        }
        if (!cancelled) {
          const mapped = payload.data.clips.map(mapClipToPost)
          setPosts(mapped.length > 0 ? mapped : createMockPosts())
        }
      } catch (error) {
        if (!cancelled) {
          setPosts(createMockPosts())
          toast({
            title: 'Unable to load feed',
            description: error instanceof Error ? error.message : 'Please try again.',
            variant: 'destructive',
          })
        }
      } finally {
        if (!cancelled) {
          setPostsLoading(false)
        }
      }
    }

    loadClips()

    return () => {
      cancelled = true
    }
  }, [toast])

  useEffect(() => {
    let cancelled = false

    const loadLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard', { credentials: 'include' })
        const payload = (await response.json()) as ApiResponse<{ leaderboard: LeaderboardApiEntry[] }>
        if (!payload.ok) {
          throw new Error(payload.error.message)
        }
        if (cancelled) {
          return
        }
        const mapped = (payload.data.leaderboard ?? []).map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          userName: entry.user.displayName ?? entry.user.username ?? 'Athlete',
          userAvatar: entry.user.avatarUrl ?? '/placeholder.svg',
          score: entry.score ?? 0,
          school: entry.sport?.name ?? '',
          sport: entry.sport?.name ?? 'MultiSport',
        }))
        setLeaderboard(injectCurrentUser(mapped))
      } catch (error) {
        if (cancelled) {
          return
        }
        setLeaderboard((previous) => {
          const baseline = previous.length ? previous : mockLeaderboard
          return injectCurrentUser(baseline)
        })
        toast({
          title: 'Unable to load leaderboard',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        })
      }
    }

    loadLeaderboard()

    return () => {
      cancelled = true
    }
  }, [injectCurrentUser, toast])

  useEffect(() => {
    setLeaderboard((previous) => {
      if (previous.length === 0) {
        return injectCurrentUser(mockLeaderboard)
      }
      return injectCurrentUser(previous)
    })
  }, [injectCurrentUser])

  useEffect(() => {
    if (!session?.user) {
      setStreak(defaultStreak)
      return
    }

    let cancelled = false

    const loadStreak = async () => {
      const { data, error } = await supabase
        .from('streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', session.user.id)
        .maybeSingle<StreakRow>()

      if (cancelled) {
        return
      }

      if (error) {
        toast({
          title: 'Unable to load streak',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      if (!data) {
        setStreak(defaultStreak)
        return
      }

      const today = new Date().toISOString().slice(0, 10)
      setStreak({
        currentStreak: data.current_streak ?? 0,
        longestStreak: data.longest_streak ?? 0,
        weeklyGoal: 5,
        weeklyProgress: Math.min(data.current_streak ?? 0, 7),
        todayCompleted: data.last_activity_date === today,
      })
    }

    loadStreak().catch((error) => {
      if (!cancelled) {
        toast({
          title: 'Unable to load streak',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        })
      }
    })

    return () => {
      cancelled = true
    }
  }, [session, supabase, toast])

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/clips/${postId}/like`, { method: 'POST', credentials: 'include' })
      const payload = (await response.json()) as ApiResponse<{ liked: boolean; count: number }>
      if (!payload.ok) {
        throw new Error(payload.error.message)
      }
      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: payload.data.liked,
                likes: payload.data.count,
              }
            : post,
        ),
      )
    } catch (error) {
      toast({
        title: 'Like failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSave = (postId: string) => {
    setPosts((previous) =>
      previous.map((post) => (post.id === postId ? { ...post, isSaved: !post.isSaved } : post)),
    )
    toast({
      title: 'Post saved',
      description: 'You can find saved posts in your profile.',
    })
  }

  const handleShare = (postId: string) => {
    setPosts((previous) =>
      previous.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)),
    )
    toast({
      title: 'Post shared',
      description: 'Link copied to clipboard!',
    })
  }

  const handleFlag = () => {
    toast({
      title: 'Content reported',
      description: 'Thank you for helping keep our community safe.',
    })
  }

  const handleJoinChallenge = () => {
    toast({
      title: 'Challenge joined!',
      description: "Good luck with today's challenge!",
    })
  }

  const handleQuickPost = () => {
    toast({
      title: 'Coming soon',
      description: 'Quick post feature will be available soon!',
    })
  }

  const showSkeleton = postsLoading && posts.length === 0

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DailyChallengeCard challenge={mockChallenge} onJoin={handleJoinChallenge} />
                <div className="space-y-4">
                  <StreakWidget streakData={streak} />
                  <Button className="w-full" onClick={handleQuickPost}>
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Post
                  </Button>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-sport-blue/10 to-sport-green/10 border-sport-blue/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Hash className="h-5 w-5 text-sport-blue" />
                    <span className="text-lg font-semibold">Hashtag of the Day:</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1 bg-sport-blue/20 text-sport-blue">
                      {hashtag.tag}
                    </Badge>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {hashtag.description}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Top posts today</h2>
                {showSkeleton ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2" role="status" aria-live="polite">
                    {skeletonFeed.map((_, index) => (
                      <Card key={`skeleton-${index}`} className="border-dashed border-muted-foreground/20 bg-card/70 shadow-sm">
                        <CardContent className="space-y-4 p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-1/3 rounded-full bg-muted animate-pulse" />
                              <div className="h-3 w-1/5 rounded-full bg-muted/80 animate-pulse" />
                            </div>
                          </div>
                          <div className="h-48 w-full rounded-xl bg-muted animate-pulse" />
                          <div className="flex gap-3">
                            <div className="h-3 w-16 rounded-full bg-muted animate-pulse" />
                            <div className="h-3 w-12 rounded-full bg-muted animate-pulse" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No clips yet. Upload your first highlight to get started!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                      <VideoCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onSave={handleSave}
                        onShare={handleShare}
                        onFlag={handleFlag}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24" aria-label="Training insights">
              <SidebarWidgets
                leaderboard={leaderboard}
                badges={mockBadges}
                teamSessions={mockTeamSessions}
                currentUserId={authUser?.id}
                profileEditHref="/settings?tab=profile"
              />
            </aside>
          </div>
        </main>

        <div className="lg:hidden space-y-6 px-4 pb-6">
          <SidebarWidgets
            leaderboard={leaderboard}
            badges={mockBadges}
            teamSessions={mockTeamSessions}
            currentUserId={authUser?.id}
            profileEditHref="/settings?tab=profile"
          />
        </div>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}



