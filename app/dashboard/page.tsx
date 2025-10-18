'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Plus, Hash, Upload, Users, Calendar, ChevronRight, Trophy, Activity } from 'lucide-react'

import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { AuthGuard } from '@/components/auth-guard'
import { VideoCard } from '@/components/video-card'
import { DailyChallengeCard } from '@/components/daily-challenge-card'
import { JoinChallengeDialog } from '@/components/join-challenge-dialog'
import { StreakWidget } from '@/components/streak-widget'
import { QuickPostDialog, type QuickPostPayload } from '@/components/quick-post-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UploadClipDialog, type UploadClipSuccessPayload } from '@/components/upload-clip-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useDailyChallenge, DAILY_CHALLENGE_STORAGE_KEY } from '@/hooks/use-daily-challenge'
import { useMediaQuery } from '@/hooks/use-media-query'
import { getSupabaseBrowserClient, type SupabaseBrowserClient } from '@/lib/supabase-browser'
import { mapClipToPost, type ClipApiResponse } from '@/lib/clips'
import { addStoredClip, loadStoredClips, removeStoredClip, saveStoredClips, storedClipToClip, type StoredClip } from '@/lib/storage/local'
import {
  mockLeaderboard,
  mockBadges,
  mockTeamSessions,
  mockPosts,
  getTodaysHashtag,
  type Post,
  type StreakData,
  type HashtagInfo,
  type LeaderboardEntry,
  type Challenge,
  type Badge as BadgeType,
} from '@/lib/mock-data'

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

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  weeklyGoal: 7,
  weeklyProgress: 0,
  todayCompleted: false,
}

const skeletonFeed = Array.from({ length: 4 })

const badgeRarityStyles: Record<BadgeType['rarity'], string> = {
  legendary: 'border-yellow-500 text-yellow-600',
  epic: 'border-purple-500 text-purple-600',
  rare: 'border-blue-500 text-blue-600',
  common: 'border-gray-500 text-gray-600',
}

const QUICK_POST_CHARACTER_LIMIT = 200

const createMockPosts = () =>
  mockPosts.map((post) => ({
    ...post,
    tags: [...post.tags],
  }))

function combineStoredAndRemote(storedClips: StoredClip[], remotePosts: Post[] | null, base: string): Post[] {
  if (!storedClips.length && remotePosts && remotePosts.length) {
    return remotePosts
  }

  const localPosts = storedClips.map((clip) => mapClipToPost(storedClipToClip(clip), base))
  const localIds = new Set(storedClips.map((clip) => clip.id))
  const remoteSource = remotePosts && remotePosts.length ? remotePosts : createMockPosts()
  const remoteFiltered = remoteSource.filter((post) => !localIds.has(post.id))

  return [...localPosts, ...remoteFiltered]
}

export default function DashboardPage() {
  const clipAssetsBase = useMemo(() => clipsPublicBase, [])
  const router = useRouter()
  const [storedClips, setStoredClips] = useState<StoredClip[]>(() => loadStoredClips())
  const [posts, setPosts] = useState<Post[]>(() => combineStoredAndRemote(loadStoredClips(), null, clipAssetsBase))
  const [postsLoading, setPostsLoading] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [streak, setStreak] = useState<StreakData>(defaultStreak)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false)
  const [showAllMobilePosts, setShowAllMobilePosts] = useState(false)
  const [openSessionId, setOpenSessionId] = useState<string | null>(null)
  const { toast } = useToast()
  const { session, user: authUser, profile } = useAuth()
  const profileUsername = profile?.username ?? ''
  const { challenge: dailyChallenge, loading: dailyChallengeLoading } = useDailyChallenge(session)
  const supabase = useMemo<SupabaseBrowserClient>(() => getSupabaseBrowserClient(), [])
  const hashtag = useMemo<HashtagInfo>(() => getTodaysHashtag(), [])
  const formattedHashtagTag = useMemo(
    () => hashtag.tag.replace(/([a-z])([A-Z])/g, '$1\u200B$2'),
    [hashtag.tag],
  )
  const storedClipsRef = useRef<StoredClip[]>(storedClips)
  const isMobile = useMediaQuery('(max-width: 767px)')

  useEffect(() => {
    storedClipsRef.current = storedClips
  }, [storedClips])

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
      sport: 'AthletIQ',
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
          const mapped = payload.data.clips.map((clip) => mapClipToPost(clip, clipAssetsBase))
          setPosts(combineStoredAndRemote(storedClipsRef.current, mapped, clipAssetsBase))
        }
      } catch (error) {
        if (!cancelled) {
          setPosts(combineStoredAndRemote(storedClipsRef.current, null, clipAssetsBase))
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
  }, [toast, clipAssetsBase])

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
          sport: entry.sport?.name ?? 'AthletIQ',
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
        weeklyGoal: defaultStreak.weeklyGoal,
        weeklyProgress: Math.min(data.current_streak ?? 0, defaultStreak.weeklyGoal),
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
      setStoredClips((previous) => {
        const hasClip = previous.some((clip) => clip.id === postId)
        if (!hasClip) {
          return previous
        }
        const updated = previous.map((clip) =>
          clip.id === postId
            ? {
                ...clip,
                metrics: {
                  ...clip.metrics,
                  likesCount: payload.data.count,
                  likedByUser: payload.data.liked,
                },
              }
            : clip,
        )
        saveStoredClips(updated)
        return updated
      })
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
      title: 'Share recorded',
      description: 'Thanks for spreading the word!',
    })
  }

  const handleFlag = () => {
    toast({
      title: 'Content reported',
      description: 'Thank you for helping keep our community safe.',
    })
  }

  const handleDeletePost = useCallback(async (postId: string) => {
    const { error } = await supabase.from('clips').delete().eq('id', postId)

    if (error) {
      console.error('[dashboard] delete clip', error)
      throw new Error('Unable to delete this post right now.')
    }

    setPosts((previous) => previous.filter((post) => post.id !== postId))

    const updatedStored = removeStoredClip(postId)
    setStoredClips(updatedStored)

    toast({
      title: 'Post deleted',
      description: 'This highlight has been removed from your feed.',
    })
  }, [supabase, toast])

  const handleJoinChallenge = useCallback((challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setJoinDialogOpen(true)
  }, [])

  const handleJoinOpenChange = useCallback((open: boolean) => {
    setJoinDialogOpen(open)

    if (!open) {
      setSelectedChallenge(null)
    }
  }, [])

  const handleConfirmChallenge = useCallback((challenge: Challenge) => {
    handleJoinOpenChange(false)

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DAILY_CHALLENGE_STORAGE_KEY, JSON.stringify(challenge))
    }

    router.push('/challenge-arena')
  }, [handleJoinOpenChange, router])

  const handleUploadComplete = useCallback((payload: UploadClipSuccessPayload) => {
    const fallbackSport = payload.form.sportName || payload.form.sportSlug
    const sanitizedClip: ClipApiResponse = {
      ...payload.clip,
      caption: payload.clip.caption ?? (payload.form.caption ? payload.form.caption.trim() : null),
      sport: payload.clip.sport ?? {
        id: null,
        slug: payload.form.sportSlug,
        name: fallbackSport,
      },
    }

    const updatedStored = addStoredClip(sanitizedClip)
    setStoredClips(updatedStored)

    const newPost = mapClipToPost(sanitizedClip, clipAssetsBase)
    setPosts((previous) => [newPost, ...previous.filter((post) => post.id !== newPost.id)])
  }, [clipAssetsBase])

  const handleQuickPostOpen = useCallback(() => {
    setIsQuickPostOpen(true)
  }, [])

  const handleQuickPostSubmit = useCallback(
    (payload: QuickPostPayload) => {
      const taggedSummary =
        payload.tags.length > 0 ? payload.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ') : null

      toast({
        title: 'Quick update shared',
        description: taggedSummary
          ? `Keep the energy high with ${taggedSummary}.`
          : 'Keep the momentum going with consistent check-ins.',
      })
    },
    [toast],
  )

  useEffect(() => {
    if (isMobile) {
      setShowAllMobilePosts(false)
    } else {
      setShowAllMobilePosts(true)
    }
  }, [isMobile])

  useEffect(() => {
    if (!isMobile) {
      setOpenSessionId(null)
    }
  }, [isMobile])

  const visiblePosts = useMemo(
    () => (isMobile && !showAllMobilePosts ? posts.slice(0, 2) : posts),
    [isMobile, showAllMobilePosts, posts],
  )

  const showSkeleton = postsLoading && posts.length === 0
  const hasMorePosts = isMobile && posts.length > visiblePosts.length
  const showStarterTiles = !showSkeleton && posts.length === 0

  const starterTiles = useMemo(
    () => [
      {
        id: 'record',
        title: 'Record your first clip',
        description: 'Capture a highlight and share it with your crew.',
        icon: Upload,
        onAction: () => setIsUploadOpen(true),
      },
      {
        id: 'challenge',
        title: "Join today's challenge",
        description: 'Jump into the community drill for bonus points.',
        icon: Trophy,
        onAction: () => {
          if (dailyChallenge) {
            handleJoinChallenge(dailyChallenge)
          } else {
            toast({
              title: 'Challenge loading',
              description: "Hang tight while we fetch today's challenge.",
            })
          }
        },
      },
      {
        id: 'session',
        title: 'Find a team session',
        description: 'Lock in reps with teammates this week.',
        icon: Users,
        onAction: () => router.push('/teams'),
      },
    ],
    [dailyChallenge, handleJoinChallenge, router, toast],
  );

  const recentFriendActivity = useMemo(
    () => [
      {
        id: 'activity-1',
        name: 'Jada Cole',
        action: 'dropped a new recovery highlight',
        detail: 'Mobility circuit - 24 reactions',
        timeAgo: '5m ago',
        avatar: null,
      },
      {
        id: 'activity-2',
        name: 'Liam Ortiz',
        action: 'set a personal best in sprint drills',
        detail: '200m repeats - 6 comments',
        timeAgo: '18m ago',
        avatar: null,
      },
      {
        id: 'activity-3',
        name: 'Maya Chen',
        action: 'joined the core strength challenge',
        detail: 'Day 3 complete - +45 pts',
        timeAgo: '32m ago',
        avatar: null,
      },
      {
        id: 'activity-4',
        name: 'Noah Patel',
        action: 'shared a film breakdown clip',
        detail: 'Varsity scrimmage - 14 saves',
        timeAgo: '1h ago',
        avatar: null,
      },
    ],
    [],
  );


  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto w-full max-w-[1380px] px-4 pb-24 pt-8 sm:px-6 md:pt-10 lg:px-8 lg:pb-12">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[65%_35%] lg:items-start lg:gap-8">
            <div className="flex flex-col gap-6">
              <div>
                {dailyChallenge ? (
                  <DailyChallengeCard
                    challenge={dailyChallenge}
                    onJoin={handleJoinChallenge}
                    className="h-full"
                  />
                ) : (
                  <Card
                    className="h-full rounded-2xl border border-dashed border-muted-foreground/30 bg-card/90 shadow-sm"
                    aria-busy={dailyChallengeLoading}
                  >
                    <CardContent className="flex flex-1 flex-col gap-4 p-6 animate-pulse">
                      <div className="h-5 w-32 rounded-full bg-muted" />
                      <div className="aspect-[16/10] w-full rounded-xl bg-muted" />
                      <div className="h-3 w-3/4 rounded-full bg-muted" />
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-20 rounded-full bg-muted" />
                        <div className="h-3 w-10 rounded-full bg-muted" />
                      </div>
                      <div className="mt-auto h-10 w-full rounded-md bg-muted" />
                    </CardContent>
                  </Card>
                )}
              </div>
              <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-foreground">Quick Actions</CardTitle>
                  <p className="text-sm text-muted-foreground">Jump back into your routine.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full rounded-full bg-sport-green text-background hover:bg-sport-green/90"
                    onClick={() => setIsUploadOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Upload clip
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-sport-green/40 text-foreground hover:border-sport-green/60 hover:bg-sport-green/10"
                    onClick={() => router.push('/teams')}
                  >
                    <Users className="h-4 w-4 text-sport-green" />
                    Create team session
                  </Button>
                  <button
                    type="button"
                    onClick={handleQuickPostOpen}
                    className="flex w-full items-center justify-between rounded-xl border border-dashed border-muted-foreground/40 bg-background/60 px-3 py-3 text-left text-sm text-muted-foreground transition-all duration-200 hover:border-sport-blue/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div className="flex items-center gap-2">
                      <span>Share a quick update...</span>
                      <Badge variant="secondary" className="rounded-full bg-sport-blue/15 text-[11px] font-medium text-sport-blue">
                        {formattedHashtagTag}
                      </Badge>
                    </div>
                    <Plus className="h-5 w-5 text-sport-blue" />
                  </button>
                </CardContent>
              </Card>
              {showStarterTiles ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {starterTiles.map((tile) => {
                    const Icon = tile.icon
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={tile.onAction}
                        className="group flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/90 p-5 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sport-blue/10 text-sport-blue transition-transform duration-200 group-hover:scale-[1.05]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="space-y-1.5">
                          <p className="text-base font-semibold text-foreground">{tile.title}</p>
                          <p className="text-sm text-muted-foreground">{tile.description}</p>
                        </div>
                        <span className="text-sm font-medium text-sport-blue transition-colors duration-200 group-hover:text-sport-blue/80">
                          Take action
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
              <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm">
                <CardHeader className="flex flex-col gap-2 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Activity className="h-4 w-4 text-sport-blue" />
                    Recent Friend Activity
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Stay caught up with your crew.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentFriendActivity.map((activity) => {
                    const initials = activity.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-3"
                      >
                        <Avatar className="h-9 w-9 ring-2 ring-background ring-offset-2 ring-offset-background/60">
                          {activity.avatar ? (
                            <AvatarImage src={activity.avatar} alt={activity.name} />
                          ) : (
                            <AvatarImage src="/placeholder.svg" alt={activity.name} />
                          )}
                          <AvatarFallback className="text-xs font-semibold uppercase text-sport-blue">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">
                            <span className="font-semibold">{activity.name}</span> {activity.action}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{activity.detail}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Top posts today</h2>
                </div>
                {showSkeleton ? (
                  <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2" role="status" aria-live="polite">
                    {skeletonFeed.map((_, index) => (
                      <Card
                        key={`skeleton-${index}`}
                        className="rounded-2xl border border-dashed border-muted-foreground/20 bg-card/70 shadow-sm"
                      >
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
                ) : visiblePosts.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {visiblePosts.map((post) => (
                      <VideoCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onSave={handleSave}
                        onShare={handleShare}
                        onFlag={handleFlag}
                        onDelete={handleDeletePost}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="mt-4 rounded-2xl border border-dashed border-muted-foreground/30 bg-card/80">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No clips yet. Upload your first highlight to get started!
                    </CardContent>
                  </Card>
                )}
                {hasMorePosts && !showAllMobilePosts ? (
                  <Button
                    variant="outline"
                    className="mt-4 w-full justify-center rounded-xl border-sport-blue/40 text-sport-blue transition-transform duration-150 hover:scale-[1.01] hover:border-sport-blue/60 hover:bg-sport-blue/10"
                    onClick={() => setShowAllMobilePosts(true)}
                  >
                    View more
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <Card className="rounded-2xl border border-sport-blue/25 bg-card/95 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="flex flex-col gap-2 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                      <Hash className="h-4 w-4 text-sport-blue" />
                      Hashtag of the Day
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="max-w-full whitespace-normal break-words rounded-full bg-sport-blue/15 px-3 py-1 text-xs font-medium text-sport-blue text-center"
                    >
                      {formattedHashtagTag}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{hashtag.description}</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full border-sport-blue/30 px-3 py-1 text-xs text-sport-blue">
                    Share a clip
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-sport-green/30 px-3 py-1 text-xs text-sport-green">
                    Tag a teammate
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-sport-orange/30 px-3 py-1 text-xs text-sport-orange">
                    Daily mindset
                  </Badge>
                </CardContent>
              </Card>

              <StreakWidget
                streakData={streak}
                className="rounded-2xl border border-sport-orange/15 bg-card/95 shadow-sm"
              />
              <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-sport-green" />
                    Team Sessions
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 rounded-full px-3 hover:bg-sport-green/10"
                    onClick={() => router.push('/teams')}
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isMobile ? (
                    <div className="space-y-3">
                      {mockTeamSessions.map((session) => {
                        const isOpen = openSessionId === session.id
                        const capacity = Math.min(100, Math.round((session.participants / session.maxParticipants) * 100))
                        return (
                          <div
                            key={session.id}
                            className="rounded-xl border border-border/50 bg-muted/20 p-3"
                          >
                            <button
                              type="button"
                              onClick={() => setOpenSessionId(isOpen ? null : session.id)}
                              className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                              <div>
                                <p className="text-sm font-semibold text-foreground">{session.title}</p>
                                <p className="text-xs text-muted-foreground">{session.sport}</p>
                              </div>
                              <ChevronRight
                                className={`h-4 w-4 transition-transform duration-150 ${isOpen ? 'rotate-90 text-sport-green' : 'text-muted-foreground'}`}
                              />
                            </button>
                            {isOpen ? (
                              <div className="mt-3 space-y-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 text-sport-blue" />
                                  <span>
                                    {session.date} - {session.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5 text-sport-green" />
                                  <span>
                                    {session.participants}/{session.maxParticipants} spots filled
                                  </span>
                                </div>
                                <Progress value={capacity} className="h-1.5" />
                                <span className="font-medium text-foreground">{session.location}</span>
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mockTeamSessions.map((session) => {
                        const capacity = Math.min(100, Math.round((session.participants / session.maxParticipants) * 100))
                        return (
                          <div
                            key={session.id}
                            className="rounded-xl border border-border/50 bg-muted/20 p-4 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{session.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {session.date} - {session.time}
                                </p>
                              </div>
                              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                                {session.sport}
                              </Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">{session.location}</p>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {session.participants}/{session.maxParticipants} spots filled
                                </span>
                                <span className="font-medium text-foreground">{capacity}%</span>
                              </div>
                              <Progress value={capacity} className="h-1.5" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-sport-orange" />
                    School Leaderboard
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 rounded-full px-3 hover:bg-sport-orange/10"
                    onClick={() => router.push('/leaderboards')}
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leaderboard.slice(0, 5).map((entry) => {
                    const isCurrentUser = entry.userId === authUser?.id
                    return (
                      <div
                        key={`${entry.userId}-${entry.rank}`}
                        className={`flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm ${isCurrentUser ? 'border-sport-blue/50 bg-sport-blue/10' : ''}`}
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
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{entry.userName}</p>
                          <p className="truncate text-xs text-muted-foreground">{entry.school || 'Not set'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-sport-blue">{entry.score}</p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground/80">weekly pts</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border/60 bg-card/95 shadow-sm transition-transform duration-200 hover:scale-[1.01]">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-sport-blue" />
                    Recent Badges
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 rounded-full px-3 hover:bg-sport-blue/10"
                    onClick={() => router.push('/profile')}
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockBadges.slice(0, 3).map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sport-blue/10 text-lg">{badge.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">{badge.earnedDate}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeRarityStyles[badge.rarity]}`}
                      >
                        {badge.rarity}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
      <JoinChallengeDialog
        challenge={selectedChallenge}
        open={joinDialogOpen}
        onOpenChange={handleJoinOpenChange}
        onConfirm={handleConfirmChallenge}
      />

      <QuickPostDialog
        open={isQuickPostOpen}
        onOpenChange={setIsQuickPostOpen}
        onSubmit={handleQuickPostSubmit}
        characterLimit={QUICK_POST_CHARACTER_LIMIT}
        suggestedHashtag={hashtag.tag}
      />

      <UploadClipDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploaded={handleUploadComplete}
      />
    </AuthGuard>
  )
}




