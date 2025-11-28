"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, Bookmark, Share2, MessageCircle, Volume2, VolumeX, Play } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CONTENT_TAGS } from '@/lib/discovery/constants'
import type { DiscoveryClip } from '@/lib/discovery/types'

interface DiscoveryFeedProps {
  clips: DiscoveryClip[]
  autoPlay?: boolean
}

export function DiscoveryFeed({ clips, autoPlay = true }: DiscoveryFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [upvotedClips, setUpvotedClips] = useState<Set<string>>(new Set())
  const [bookmarkedClips, setBookmarkedClips] = useState<Set<string>>(new Set())
  const [upvoteCounts, setUpvoteCounts] = useState<Map<string, number>>(new Map())

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const { toast } = useToast()

  const currentClip = clips[currentIndex]

  // Initialize upvote counts
  useEffect(() => {
    const counts = new Map()
    clips.forEach(clip => counts.set(clip.id, clip.upvotes))
    setUpvoteCounts(counts)
  }, [clips])

  // Auto-play/pause video
  useEffect(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
    }
  }, [isPlaying, currentIndex])

  // Navigate to next/prev clip
  const goToClip = useCallback((index: number) => {
    if (index < 0 || index >= clips.length) return
    setCurrentIndex(index)
    setIsPlaying(autoPlay)
  }, [clips.length, autoPlay])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToClip(currentIndex - 1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToClip(currentIndex + 1)
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(prev => !prev)
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, goToClip])

  // Touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY.current - touchEndY

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToClip(currentIndex + 1)
      } else {
        goToClip(currentIndex - 1)
      }
    }
  }

  // Wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      if (e.deltaY > 50) {
        goToClip(currentIndex + 1)
      } else if (e.deltaY < -50) {
        goToClip(currentIndex - 1)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [currentIndex, goToClip])

  const handleUpvote = () => {
    if (!currentClip) return

    const isUpvoted = upvotedClips.has(currentClip.id)
    const newUpvotedClips = new Set(upvotedClips)
    const newCounts = new Map(upvoteCounts)

    if (isUpvoted) {
      newUpvotedClips.delete(currentClip.id)
      newCounts.set(currentClip.id, (upvoteCounts.get(currentClip.id) || currentClip.upvotes) - 1)
    } else {
      newUpvotedClips.add(currentClip.id)
      newCounts.set(currentClip.id, (upvoteCounts.get(currentClip.id) || currentClip.upvotes) + 1)

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
    }

    setUpvotedClips(newUpvotedClips)
    setUpvoteCounts(newCounts)
  }

  const handleBookmark = () => {
    if (!currentClip) return

    const isBookmarked = bookmarkedClips.has(currentClip.id)
    const newBookmarkedClips = new Set(bookmarkedClips)

    if (isBookmarked) {
      newBookmarkedClips.delete(currentClip.id)
      toast({ title: 'Removed from saved' })
    } else {
      newBookmarkedClips.add(currentClip.id)
      toast({ title: 'Saved to collection' })
    }

    setBookmarkedClips(newBookmarkedClips)
  }

  const handleShare = () => {
    toast({
      title: 'Link copied!',
      description: 'Share this epic moment with your crew',
    })
  }

  const handleComment = () => {
    toast({
      title: 'Comments',
      description: 'Comment system coming soon!',
    })
  }

  if (!currentClip) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white/60">No clips available</p>
      </div>
    )
  }

  const isUpvoted = upvotedClips.has(currentClip.id)
  const isBookmarked = bookmarkedClips.has(currentClip.id)
  const currentUpvotes = upvoteCounts.get(currentClip.id) || currentClip.upvotes

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={currentClip.videoUrl}
        poster={currentClip.thumbnailUrl}
        loop
        muted={isMuted}
        playsInline
        autoPlay={autoPlay}
        className="absolute top-[500px] bottom-0 left-0 right-0 w-full object-contain"
        onClick={() => setIsPlaying(prev => !prev)}
      />

      {/* Gradient overlays */}
      <div className="absolute top-[500px] bottom-0 left-0 right-0 bg-gradient-to-b from-black/60 via-transparent via-40% to-black/80 pointer-events-none" />

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute top-[500px] bottom-0 left-0 right-0 flex items-center justify-center bg-black/30 animate-in fade-in duration-200">
          <div className="rounded-full bg-white/20 backdrop-blur-sm p-6 animate-in zoom-in duration-200">
            <Play className="h-12 w-12 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Top info bar */}
      <div className="absolute top-[520px] left-0 right-0 z-10 px-6">
        {currentClip.isSponsored ? (
          /* Sponsored Content Layout */
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-yellow-500 ring-2 ring-yellow-500/30">
              <AvatarImage src={currentClip.sponsorLogo || currentClip.athleteAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold">
                {currentClip.sponsorName?.[0] || currentClip.athleteName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-black font-bold text-xs px-2 py-0.5 border-0">
                  SPONSORED
                </Badge>
              </div>
              <h3 className="font-bold text-white text-base truncate drop-shadow-lg mt-1">
                {currentClip.sponsorName || currentClip.athleteName}
              </h3>
            </div>
          </div>
        ) : (
          /* Regular Content Layout */
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/30 ring-2 ring-black/20">
              <AvatarImage src={currentClip.athleteAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-sport-blue to-sport-green text-white font-bold">
                {currentClip.athleteName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base truncate drop-shadow-lg">
                {currentClip.athleteName}
              </h3>
              <p className="text-sm text-white/80 truncate drop-shadow">
                {currentClip.athleteLocation && `${currentClip.athleteLocation} · `}
                {currentClip.sport}
                {currentClip.sportLevel && ` · ${currentClip.sportLevel.replace('_', ' ')}`}
              </p>
            </div>

            {currentClip.isWholesome && (
              <Badge className="bg-pink-500/90 text-white border-0 backdrop-blur-sm">
                💝 Wholesome
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 pb-8">
        <div className="flex items-end gap-4">
          {/* Left: Caption & tags */}
          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-white text-base leading-relaxed drop-shadow-lg line-clamp-3">
              {currentClip.caption}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {currentClip.tags.slice(0, 3).map((tagId) => {
                const tag = CONTENT_TAGS.find(t => t.id === tagId)
                return tag ? (
                  <Badge
                    key={tagId}
                    variant="secondary"
                    className="bg-white/15 backdrop-blur-md text-white border-white/20 text-xs"
                  >
                    <span className="mr-1">{tag.icon}</span>
                    {tag.label}
                  </Badge>
                ) : null
              })}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {currentUpvotes.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {currentClip.comments.toLocaleString()}
              </span>
              <span>{currentClip.views.toLocaleString()} views</span>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex flex-col items-center gap-5 pb-2">
            {/* Upvote */}
            <button
              onClick={handleUpvote}
              className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
            >
              <div className={cn(
                "rounded-full p-3 transition-all duration-300",
                isUpvoted
                  ? "bg-red-600 text-white scale-110"
                  : "bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 hover:scale-110"
              )}>
                <Heart
                  className={cn(
                    "h-7 w-7 transition-all duration-300",
                    isUpvoted && "fill-current animate-in zoom-in"
                  )}
                />
              </div>
              <span className={cn(
                "text-white text-sm font-semibold drop-shadow-lg transition-all",
                isUpvoted && "scale-110 text-red-400"
              )}>
                {currentUpvotes >= 1000 ? `${(currentUpvotes / 1000).toFixed(1)}K` : currentUpvotes}
              </span>
            </button>

            {/* Comments */}
            <button
              onClick={handleComment}
              className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
            >
              <div className="rounded-full p-3 bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-all hover:scale-110">
                <MessageCircle className="h-7 w-7" />
              </div>
              <span className="text-white text-sm font-semibold drop-shadow-lg">
                {currentClip.comments >= 1000 ? `${(currentClip.comments / 1000).toFixed(1)}K` : currentClip.comments}
              </span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
            >
              <div className={cn(
                "rounded-full p-3 transition-all duration-300",
                isBookmarked
                  ? "bg-yellow-500 text-white scale-110"
                  : "bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 hover:scale-110"
              )}>
                <Bookmark
                  className={cn(
                    "h-7 w-7 transition-all duration-300",
                    isBookmarked && "fill-current"
                  )}
                />
              </div>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
            >
              <div className="rounded-full p-3 bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-all hover:scale-110">
                <Share2 className="h-7 w-7" />
              </div>
            </button>

            {/* Volume toggle */}
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
            >
              <div className="rounded-full p-3 bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-all hover:scale-110">
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation indicators */}
      <div className="absolute right-2 top-[calc(50%+250px)] -translate-y-1/2 z-20 flex flex-col gap-1">
        {clips.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToClip(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              idx === currentIndex
                ? "w-8 bg-white"
                : "w-1.5 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>

      {/* Swipe hint (mobile) */}
      {currentIndex === 0 && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <p className="text-xs text-white/50 drop-shadow">Swipe up for next ↑</p>
        </div>
      )}

      {/* Keyboard hints (desktop) */}
      <div className="hidden md:block absolute top-[calc(50%+250px)] left-6 -translate-y-1/2 z-20 text-white/40 text-xs">
        <div className="flex flex-col gap-2">
          <p>↑↓ Navigate</p>
          <p>Space Pause</p>
          <p>M Mute</p>
        </div>
      </div>
    </div>
  )
}
