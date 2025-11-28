"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { DiscoveryClip } from '@/lib/discovery/types'
import { CommentsDrawer } from './comments-drawer'
import { EmojiBadgePicker } from './emoji-badge-picker'
import { RightActionRail } from './right-action-rail'
import { CreatorInfoCard } from './creator-info-card'

interface ReelsFeedProps {
  clips: DiscoveryClip[]
  autoPlay?: boolean
  onClipChange?: (index: number) => void
}

export function ReelsFeed({ clips, autoPlay = true, onClipChange }: ReelsFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [showBadgePicker, setShowBadgePicker] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  const touchStartY = useRef(0)
  const lastScrollTime = useRef(0)
  const prevClipsLength = useRef(clips.length)
  const { toast } = useToast()

  const [clipStates, setClipStates] = useState(() =>
    clips.map(clip => ({
      hasUpvoted: clip.hasUpvoted,
      isBookmarked: clip.isBookmarked,
      upvotes: clip.upvotes,
      comments: clip.comments,
      shares: clip.shares,
    }))
  )

  // Sync clipStates when clips array length changes
  useEffect(() => {
    if (prevClipsLength.current !== clips.length) {
      setClipStates(
        clips.map(clip => ({
          hasUpvoted: clip.hasUpvoted,
          isBookmarked: clip.isBookmarked,
          upvotes: clip.upvotes,
          comments: clip.comments,
          shares: clip.shares,
        }))
      )
      prevClipsLength.current = clips.length

      // Reset to first clip if current index is out of bounds
      if (currentIndex >= clips.length && clips.length > 0) {
        setCurrentIndex(0)
      }
    }
  }, [clips, currentIndex])

  const currentClip = clips[currentIndex]

  // Play/pause videos based on current index
  useEffect(() => {
    if (!autoPlay) return

    const currentVideo = videoRefs.current.get(currentIndex)

    // Pause all videos
    videoRefs.current.forEach((video, index) => {
      if (index !== currentIndex) {
        video.pause()
        video.currentTime = 0
      }
    })

    // Play current video
    if (currentVideo) {
      currentVideo.currentTime = 0
      currentVideo.play().catch(() => {
        // Auto-play blocked
      })
    }

    onClipChange?.(currentIndex)
  }, [currentIndex, autoPlay, onClipChange])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return

      if (e.key === 'ArrowUp' && currentIndex > 0) {
        goToPrev()
      } else if (e.key === 'ArrowDown' && currentIndex < clips.length - 1) {
        goToNext()
      } else if (e.key === 'm' || e.key === 'M') {
        setMuted(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, clips.length, isTransitioning])

  // Wheel navigation with throttle
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) return

      const now = Date.now()
      if (now - lastScrollTime.current < 800) return

      e.preventDefault()
      lastScrollTime.current = now

      if (e.deltaY > 0 && currentIndex < clips.length - 1) {
        goToNext()
      } else if (e.deltaY < 0 && currentIndex > 0) {
        goToPrev()
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
  }, [currentIndex, clips.length, isTransitioning])

  // Touch navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isTransitioning) return

    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY.current - touchEndY

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < clips.length - 1) {
        goToNext()
      } else if (diff < 0 && currentIndex > 0) {
        goToPrev()
      }
    }
  }

  const goToNext = useCallback(() => {
    if (currentIndex < clips.length - 1 && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex(prev => prev + 1)
      setTimeout(() => setIsTransitioning(false), 500)
    }
  }, [currentIndex, clips.length, isTransitioning])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex(prev => prev - 1)
      setTimeout(() => setIsTransitioning(false), 500)
    }
  }, [currentIndex, isTransitioning])

  const handleUpvote = () => {
    setClipStates(prev => {
      const newStates = [...prev]
      const current = newStates[currentIndex]
      current.hasUpvoted = !current.hasUpvoted
      current.upvotes += current.hasUpvoted ? 1 : -1
      return newStates
    })

    if (!clipStates[currentIndex].hasUpvoted) {
      toast({
        title: 'Loved it! 🔥',
        description: 'Your support helps this athlete grow',
      })
    }
  }

  const handleBookmark = () => {
    setClipStates(prev => {
      const newStates = [...prev]
      newStates[currentIndex].isBookmarked = !newStates[currentIndex].isBookmarked
      return newStates
    })

    toast({
      title: clipStates[currentIndex].isBookmarked ? 'Removed from bookmarks' : 'Saved! 📌',
      description: clipStates[currentIndex].isBookmarked
        ? 'Removed from your collection'
        : 'Added to your saved highlights',
    })
  }

  const handleShare = () => {
    setClipStates(prev => {
      const newStates = [...prev]
      newStates[currentIndex].shares += 1
      return newStates
    })

    toast({
      title: 'Shared! 🚀',
      description: 'Spreading the love for great sports moments',
    })
  }

  const handleComment = () => {
    setShowComments(true)
  }

  const handleAddReaction = () => {
    setShowBadgePicker(true)
  }

  const handleVideoClick = () => {
    const currentVideo = videoRefs.current.get(currentIndex)
    if (currentVideo) {
      if (currentVideo.paused) {
        currentVideo.play()
      } else {
        currentVideo.pause()
      }
    }
  }

  if (!currentClip || clips.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <p className="text-white/60">No clips available</p>
          <p className="text-sm text-white/40">Adjust your filters to see more content</p>
        </div>
      </div>
    )
  }

  const currentState = clipStates[currentIndex] || {
    hasUpvoted: currentClip.hasUpvoted,
    isBookmarked: currentClip.isBookmarked,
    upvotes: currentClip.upvotes,
    comments: currentClip.comments,
    shares: currentClip.shares,
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative h-screen w-full overflow-hidden bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video container with transition */}
        <div className="relative h-full w-full">
          {clips.map((clip, index) => {
            const isActive = index === currentIndex
            const offset = index - currentIndex

            return (
              <div
                key={clip.id}
                className={cn(
                  "absolute inset-0 transition-all duration-500 ease-out",
                  isActive ? "opacity-100 translate-y-0 z-10" : "opacity-0 pointer-events-none",
                  offset > 0 && "translate-y-full",
                  offset < 0 && "-translate-y-full"
                )}
              >
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(index, el)
                    else videoRefs.current.delete(index)
                  }}
                  src={clip.videoUrl}
                  poster={clip.thumbnailUrl}
                  loop
                  muted={muted}
                  playsInline
                  onClick={handleVideoClick}
                  className="h-full w-full object-cover cursor-pointer"
                />
              </div>
            )
          })}
        </div>

        {/* Gradient overlays for better text readability */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Top gradient for header */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
          {/* Bottom gradient for creator info - stronger and taller */}
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
        </div>

        {/* Volume control - top right */}
        <div className="absolute top-4 right-4 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMuted(!muted)}
            className="rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border border-white/20 shadow-lg h-10 w-10"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation arrows (desktop) - subtle and small */}
        <div className="hidden lg:flex absolute left-4 bottom-40 flex-col gap-2 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="rounded-full bg-black/30 backdrop-blur-sm text-white/60 hover:bg-black/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed h-9 w-9 transition-all"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            disabled={currentIndex === clips.length - 1}
            className="rounded-full bg-black/30 backdrop-blur-sm text-white/60 hover:bg-black/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed h-9 w-9 transition-all"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Creator info card - bottom left with proper spacing */}
        <div className="absolute bottom-0 left-0 right-20 sm:right-28 px-4 pb-12 z-30">
          <div className="max-w-xl">
            <CreatorInfoCard
              athleteName={currentClip.athleteName}
              athleteUsername={currentClip.athleteUsername}
              athleteAvatar={currentClip.athleteAvatar}
              athleteLocation={currentClip.athleteLocation}
              isSponsored={currentClip.isSponsored}
              sponsorName={currentClip.sponsorName}
              sponsorLogo={currentClip.sponsorLogo}
              caption={currentClip.caption}
              tags={currentClip.tags}
              onFollowClick={() => {
                toast({
                  title: `Following ${currentClip.athleteName}! 🎉`,
                  description: "You'll see more of their content",
                })
              }}
            />
          </div>
        </div>

        {/* Right action rail */}
        {!currentClip.isSponsored && (
          <RightActionRail
            upvotes={currentState.upvotes}
            comments={currentState.comments}
            shares={currentState.shares}
            cheerCount={currentClip.reactions?.length || 0}
            hasUpvoted={currentState.hasUpvoted}
            isBookmarked={currentState.isBookmarked}
            onUpvote={handleUpvote}
            onComment={handleComment}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onCheer={handleAddReaction}
          />
        )}
        {currentClip.isSponsored && (
          <RightActionRail
            upvotes={0}
            comments={0}
            shares={currentState.shares}
            cheerCount={0}
            hasUpvoted={false}
            isBookmarked={false}
            showCheer={false}
            onUpvote={() => {}}
            onComment={() => {}}
            onShare={handleShare}
            onBookmark={() => {}}
          />
        )}

        {/* Progress indicator - clean dots, only show if more than 3 clips */}
        {clips.length > 3 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 py-2">
            {clips.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    setCurrentIndex(index)
                    setTimeout(() => setIsTransitioning(false), 500)
                  }
                }}
                className={cn(
                  "w-1 rounded-full transition-all duration-300 ease-out cursor-pointer",
                  index === currentIndex
                    ? "h-8 bg-white shadow-sm"
                    : "h-2 bg-white/40 hover:bg-white/60 hover:h-3"
                )}
                aria-label={`Go to clip ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Swipe hint (mobile) */}
        {currentIndex === 0 && clips.length > 1 && (
          <div className="lg:hidden absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-bounce">
            <p className="text-white/40 text-[11px] font-medium">Swipe up for more</p>
          </div>
        )}
      </div>

      {/* Comments drawer */}
      <CommentsDrawer
        open={showComments}
        onClose={() => setShowComments(false)}
        clip={currentClip}
        onCommentAdded={() => {
          setClipStates(prev => {
            const newStates = [...prev]
            newStates[currentIndex].comments += 1
            return newStates
          })
        }}
      />

      {/* Emoji badge picker */}
      <EmojiBadgePicker
        open={showBadgePicker}
        onClose={() => setShowBadgePicker(false)}
        onBadgeSelect={(badge) => {
          toast({
            title: `${badge.emoji} Cheer sent!`,
            description: `You cheered with ${badge.name}`,
          })
          setShowBadgePicker(false)
        }}
      />
    </>
  )
}
