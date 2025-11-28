'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Plus, Hash, Upload, Users, ChevronRight, Trophy } from 'lucide-react'
import { useAppMode } from '@/contexts/app-mode-context'

import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { AuthGuard } from '@/components/auth-guard'
import { VideoCard } from '@/components/video-card'
import { DailyChallengeCard } from '@/components/daily-challenge-card'
import { JoinChallengeDialog } from '@/components/join-challenge-dialog'
import { StreakWidget } from '@/components/streak-widget'
import { EnhancedStreakWidget } from '@/components/enhanced-streak-widget'
import { TrainingBuddies } from '@/components/training-buddies'
import { QuickPostDialog, type QuickPostPayload } from '@/components/quick-post-dialog'
import { useStreaks } from '@/hooks/use-streaks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { UploadClipDialog, type UploadClipSuccessPayload } from '@/components/upload-clip-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useDailyChallenge, DAILY_CHALLENGE_STORAGE_KEY } from '@/hooks/use-daily-challenge'
import { useMediaQuery } from '@/hooks/use-media-query'
import { getSupabaseBrowserClient, type SupabaseBrowserClient } from '@/lib/supabase-browser'
import { mapClipToPost, type ClipApiResponse } from '@/lib/clips'
import { addStoredClip, loadStoredClips, removeStoredClip, saveStoredClips, storedClipToClip, type StoredClip } from '@/lib/storage/local'
import { trackChallengeJoined, trackReminderSet } from '@/lib/analytics'
import {
  mockLeaderboard,
  mockPosts,
  mockTrainingBuddies,
  mockUpcomingEvents,
  type Post,
  type StreakData,
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
  const { mode } = useAppMode()
  const [storedClips, setStoredClips] = useState<StoredClip[]>(() => loadStoredClips())
  const [posts, setPosts] = useState<Post[]>(() => combineStoredAndRemote(loadStoredClips(), null, clipAssetsBase))
  const [postsLoading, setPostsLoading] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [streak, setStreak] = useState<StreakData>(defaultStreak)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false)
  const [showAllMobilePosts, setShowAllMobilePosts] = useState(false)
  const { toast } = useToast()
  const { session, user: authUser, profile } = useAuth()
  const profileUsername = profile?.username ?? ''
  const { challenge: dailyChallenge, loading: dailyChallengeLoading } = useDailyChallenge(session)
  const supabase = useMemo<SupabaseBrowserClient>(() => getSupabaseBrowserClient(), [])
  const { allSportStreak, freezes, loading: streaksLoading } = useStreaks(session)
  const storedClipsRef = useRef<StoredClip[]>(storedClips)
  const isMobile = useMediaQuery('(max-width: 767px)')

  // No auto-redirect - let users navigate manually

  useEffect(() => {
    storedClipsRef.current = storedClips
  }, [storedClips])


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

    // Track analytics
    trackChallengeJoined({
      challengeId: challenge.id,
      sport: challenge.sportSlug,
      difficulty: challenge.difficulty,
      points: challenge.points,
      source: 'dashboard',
    })
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

  const handleViewSoccerLevels = useCallback(() => {
    router.push('/progression')
  }, [router])

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

  const visiblePosts = useMemo(
    () => (isMobile && !showAllMobilePosts ? posts.slice(0, 2) : posts),
    [isMobile, showAllMobilePosts, posts],
  )

  const showSkeleton = postsLoading && posts.length === 0
  const hasMorePosts = isMobile && posts.length > visiblePosts.length
  const showStarterTiles = !showSkeleton && posts.length === 0
  const glassCard =
    'group relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.12] backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(15,23,42,0.4)] hover:scale-[1.01] dark:border-white/12 dark:bg-white/[0.07] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_30px_70px_rgba(0,0,0,0.7)] animate-fade-in-up'
  const staticGlassCard =
    'relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.12] backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.3)] dark:border-white/12 dark:bg-white/[0.07] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
  const softTile =
    'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-white/25 hover:bg-white/10 hover:shadow-[0_18px_35px_rgba(15,23,42,0.3)] hover:scale-[1.02] dark:border-white/12 dark:bg-white/[0.06] dark:hover:shadow-[0_18px_35px_rgba(0,0,0,0.5)] animate-fade-in'

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
        name: 'LeBron',
        action: 'dropped 42 at 42 and smiled, saying "still got it."',
        detail: 'Postgame clip, 1.8k reactions • 7m ago',
        avatar: null,
      },
      {
        id: 'activity-2',
        name: 'Travis Kelce',
        action: 'just got engaged, losing to the Eagles is no longer the saddest thing in my life.',
        detail: 'Highlights, 2.4k reactions • 5m ago',
        avatar: null,
      },
      {
        id: 'activity-3',
        name: 'Max Verstappen',
        action: 'says "If my mum had balls, she would be my dad."',
        detail: 'Paddock mic drop, 3.3k reactions • 12m ago',
        avatar: null,
      },
      {
        id: 'activity-4',
        name: 'Virat Kohli',
        action: 'says he retired because he hated coloring his beard every 3-4 weeks. What a dingus.',
        detail: 'Press conference clip, 2.1k reactions • 20m ago',
        avatar: null,
      },
    ],
    [],
  );


  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background/70 to-muted dark:bg-black">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-44 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-sport-blue/40 via-sport-green/20 to-transparent blur-3xl opacity-70 dark:opacity-30 dark:from-sport-blue/25 dark:via-sport-green/15" />
          <div className="absolute top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 opacity-15 blur-3xl dark:opacity-5 dark:border-white/12" />
          <div className="absolute -bottom-36 -right-20 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-sport-orange/40 via-sport-blue/25 to-transparent blur-[120px] opacity-70 dark:opacity-25 dark:from-sport-orange/20 dark:via-sport-blue/15" />
          <div className="absolute inset-x-0 top-24 h-40 bg-gradient-to-r from-sport-blue/20 via-sport-green/15 to-sport-orange/20 blur-3xl opacity-60 dark:opacity-20 dark:from-sport-blue/10 dark:via-sport-green/8 dark:to-sport-orange/10" />
        </div>
        <Header />

        <main className="relative z-10 mx-auto w-full max-w-[1380px] px-3 sm:px-4 pb-24 pt-6 sm:pt-8 md:pt-10 lg:px-8 lg:pb-12 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:h-[420px] before:bg-gradient-to-t before:from-sport-orange/10 before:via-background/60 before:to-transparent before:opacity-80 before:content-[''] before:-z-10 dark:before:from-sport-orange/5 dark:before:via-black/80">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[65%_35%] lg:items-start lg:gap-8">
            <div className="flex flex-col gap-6">
              <div>
                {dailyChallenge ? (
                  <DailyChallengeCard
                    challenge={dailyChallenge}
                    onJoin={handleJoinChallenge}
                    currentStreak={streak.currentStreak}
                    onRemindLater={() => {
                      const remindTime = new Date(Date.now() + 2 * 60 * 60 * 1000)
                      if (typeof window !== 'undefined') {
                        window.sessionStorage.setItem('daily-challenge-remind-at', remindTime.toISOString())
                      }
                      toast({
                        title: 'Reminder set',
                        description: "We'll remind you about today's challenge in 2 hours.",
                      })

                      // Track analytics
                      trackReminderSet({
                        challengeId: dailyChallenge.id,
                        reminderType: 'snooze',
                        remindAt: remindTime.toISOString(),
                        hoursFromNow: 2,
                      })
                    }}
                    className="h-full"
                  />
                ) : (
                  <Card
                    className="relative h-full overflow-hidden rounded-3xl border border-dashed border-white/25 bg-white/5 backdrop-blur-xl shadow-[0_25px_60px_rgba(15,23,42,0.35)]"
                    aria-busy={dailyChallengeLoading}
                  >
                    <span className="absolute inset-0 bg-gradient-to-br from-sport-blue/10 via-transparent to-sport-orange/15 opacity-70" />
                    <CardContent className="relative flex flex-1 flex-col gap-4 p-6 animate-pulse">
                      <div className="h-5 w-32 rounded-full bg-white/10" />
                      <div className="aspect-[16/10] w-full rounded-xl bg-white/10" />
                      <div className="h-3 w-3/4 rounded-full bg-white/10" />
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-20 rounded-full bg-white/10" />
                        <div className="h-3 w-10 rounded-full bg-white/10" />
                      </div>
                      <div className="mt-auto h-10 w-full rounded-md bg-white/10" />
                    </CardContent>
                  </Card>
                )}
              </div>
              <Card className={`${glassCard}`}>
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sport-blue/[0.08] to-sport-green/[0.08] opacity-60 transition-opacity duration-300 group-hover:opacity-80 dark:from-sport-blue/[0.05] dark:to-sport-green/[0.05] dark:opacity-40" />
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-base font-semibold text-foreground">Quick Actions</CardTitle>
                  <p className="text-sm text-muted-foreground">Jump back into your routine.</p>
                </CardHeader>
                <CardContent className="relative z-10 space-y-3">
                  <Button
                    size="lg"
                    className="w-full rounded-full bg-gradient-to-r from-sport-green/80 via-sport-green to-sport-blue text-white shadow-[0_18px_35px_rgba(34,197,94,0.35)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_22px_45px_rgba(2,132,199,0.45)] hover:scale-[1.02] dark:from-sport-green/90 dark:via-sport-green dark:to-sport-blue animate-pulse-glow"
                    onClick={() => setIsUploadOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Upload clip
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-white/20 bg-white/5 text-foreground transition-all duration-200 hover:border-sport-green/60 hover:bg-sport-green/10"
                    onClick={() => {
                      toast({
                        title: 'Coming soon!',
                        description: 'Check out Training Partners in the sidebar for connection options.',
                      })
                    }}
                  >
                    <Users className="h-4 w-4 text-sport-green" />
                    Find training partners
                  </Button>
                  <button
                    type="button"
                    onClick={handleQuickPostOpen}
                    className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-left text-sm text-muted-foreground transition-all duration-200 hover:border-sport-blue/50 hover:bg-sport-blue/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <span>Share a quick update...</span>
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
                        className={`${softTile} flex flex-col gap-3 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
                      >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sport-blue transition-transform duration-200 group-hover:scale-[1.05]">
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
{/* Recent Friend Activity moved to Discovery page */}
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h2 className="bg-gradient-to-r from-sport-blue via-sport-green to-sport-orange bg-clip-text text-xl font-bold text-transparent sm:text-2xl md:text-3xl">
                    Top posts today
                  </h2>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Fresh heat from your network in one scroll.
                  </span>
                </div>
                {showSkeleton ? (
                  <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2" role="status" aria-live="polite">
                    {skeletonFeed.map((_, index) => (
                      <Card
                        key={`skeleton-${index}`}
                        className="relative overflow-hidden rounded-3xl border border-dashed border-white/20 bg-white/5 backdrop-blur-xl"
                      >
                        <span className="absolute inset-0 bg-gradient-to-br from-sport-blue/10 via-transparent to-sport-orange/10 opacity-50" />
                        <CardContent className="relative space-y-4 p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-1/3 rounded-full bg-white/10 animate-pulse" />
                              <div className="h-3 w-1/5 rounded-full bg-white/10 animate-pulse" />
                            </div>
                          </div>
                          <div className="h-48 w-full rounded-xl bg-white/10 animate-pulse" />
                          <div className="flex gap-3">
                            <div className="h-3 w-16 rounded-full bg-white/10 animate-pulse" />
                            <div className="h-3 w-12 rounded-full bg-white/10 animate-pulse" />
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
                  <Card className="relative mt-4 overflow-hidden rounded-3xl border border-dashed border-white/20 bg-white/5 backdrop-blur-xl">
                    <span className="absolute inset-0 bg-gradient-to-br from-sport-blue/10 via-transparent to-sport-green/10 opacity-70" />
                    <CardContent className="relative p-6 text-center text-muted-foreground">
                      No clips yet. Upload your first highlight to get started!
                    </CardContent>
                  </Card>
                )}
                {hasMorePosts && !showAllMobilePosts ? (
                  <Button
                    variant="outline"
                    className="mt-4 w-full justify-center rounded-full border-white/20 bg-white/5 text-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-sport-blue/15 hover:text-white"
                    onClick={() => setShowAllMobilePosts(true)}
                  >
                    View more
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Streak Widget */}
              {allSportStreak && !streaksLoading ? (
                <EnhancedStreakWidget
                  streakData={allSportStreak}
                  freezes={freezes}
                  onViewDetails={() => router.push('/stats')}
                  className={`${staticGlassCard} border-white/10`}
                />
              ) : (
                <StreakWidget
                  streakData={streak}
                  className={`${staticGlassCard} border-white/10`}
                />
              )}

              {/* Training Buddies & Events */}
              <TrainingBuddies
                buddies={mockTrainingBuddies}
                upcomingEvents={mockUpcomingEvents}
                onFindPartners={() => {
                  toast({
                    title: 'Coming soon!',
                    description: 'Training partner matching will be available soon.',
                  })
                }}
                onViewEvents={() => {
                  toast({
                    title: 'Coming soon!',
                    description: 'Event browser will be available soon.',
                  })
                }}
                className={`${glassCard}`}
              />

              {/* Leaderboard and Badges moved to Profile page */}
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
      />

      <UploadClipDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploaded={handleUploadComplete}
      />
    </AuthGuard>
  )
}




