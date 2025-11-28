"use client"

import { useState, useEffect, useRef } from 'react';
import { Heart, Bookmark, Share2, MapPin, MessageCircle, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { DiscoveryClip } from '@/lib/discovery/types';
import { CONTENT_TAGS } from '@/lib/discovery/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface DiscoveryFeedProps {
  clips: DiscoveryClip[];
  userRole?: 'athlete' | 'scout' | 'admin';
}

export function DiscoveryFeed({ clips, userRole = 'athlete' }: DiscoveryFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset index if it goes out of bounds when clips array changes
  useEffect(() => {
    if (clips.length > 0 && currentIndex >= clips.length) {
      setCurrentIndex(0);
    } else if (clips.length === 0) {
      setCurrentIndex(0);
    }
  }, [clips.length, currentIndex]);

  const currentClip = clips[currentIndex] || null;

  // Initialize states from current clip
  useEffect(() => {
    if (currentClip) {
      setIsBookmarked(currentClip.isBookmarked || false);
      setHasUpvoted(currentClip.hasUpvoted || false);
      setUpvoteCount(currentClip.upvotes);
    }
  }, [currentClip]);

  // Auto-play current video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Auto-play blocked, user needs to interact first
      });
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'ArrowDown' && currentIndex < clips.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, clips.length]);

  // Mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      e.preventDefault();

      if (e.deltaY > 0 && currentIndex < clips.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentIndex, clips.length]);

  const handleUpvote = () => {
    if (hasUpvoted) {
      setHasUpvoted(false);
      setUpvoteCount(prev => prev - 1);
    } else {
      setHasUpvoted(true);
      setUpvoteCount(prev => prev + 1);
      toast({
        title: 'Upvoted! 🎉',
        description: 'Helping great content get discovered',
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Bookmark removed' : 'Athlete bookmarked',
      description: isBookmarked
        ? 'Removed from your saved athletes'
        : 'Added to your saved athletes',
    });
  };

  const handleShare = () => {
    toast({
      title: 'Share feature coming soon',
      description: 'Share this incredible moment with others',
    });
  };

  const handleContact = () => {
    toast({
      title: 'Message request sent',
      description: `${currentClip.athleteName} will be notified of your interest`,
    });
  };

  const goToNext = () => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentClip) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">No clips available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={currentClip.videoUrl}
        poster={currentClip.thumbnailUrl}
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-contain"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Navigation arrows (desktop) */}
      <div className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col gap-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={currentIndex === clips.length - 1}
          className="rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <div className="flex items-end justify-between gap-4">
          {/* Left: Athlete info & caption OR Sponsored content */}
          <div className="flex-1 space-y-3 max-w-2xl">
            {currentClip.isSponsored ? (
              /* Sponsored Ad Layout */
              <>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold">
                    SPONSORED
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-yellow-500">
                    <AvatarImage src={currentClip.sponsorLogo} />
                    <AvatarFallback>{currentClip.sponsorName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {currentClip.sponsorName}
                    </h3>
                    <div className="text-white/80 text-sm">
                      Advertisement
                    </div>
                  </div>
                </div>
                <p className="text-white text-base leading-relaxed">
                  {currentClip.caption}
                </p>
              </>
            ) : (
              /* Regular Athlete Content */
              <>
                {/* Athlete info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white/30">
                    <AvatarImage src={currentClip.athleteAvatar} />
                    <AvatarFallback>{currentClip.athleteName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {currentClip.athleteName}
                    </h3>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <MapPin className="h-3 w-3" />
                      {currentClip.athleteLocation} · Age {currentClip.athleteAge}
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-white text-base leading-relaxed">
                  {currentClip.caption}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {currentClip.tags.map((tagId) => {
                    const tag = CONTENT_TAGS.find(t => t.id === tagId);
                    return tag ? (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="bg-white/15 backdrop-blur-sm text-white border-white/20"
                      >
                        <span className="mr-1">{tag.icon}</span>
                        {tag.label}
                      </Badge>
                    ) : null;
                  })}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span>{currentClip.views.toLocaleString()} views</span>
                  <span>·</span>
                  <span>{new Date(currentClip.createdAt).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Right: Action buttons */}
          <div className="flex flex-col items-center gap-4">
            {!currentClip.isSponsored && (
              <>
                {/* Upvote */}
                <button
                  onClick={handleUpvote}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={cn(
                    "rounded-full p-3 transition-all duration-200",
                    hasUpvoted
                      ? "bg-red-600 text-white"
                      : "bg-white/15 backdrop-blur-sm text-white hover:bg-white/25"
                  )}>
                    <Heart
                      className={cn("h-6 w-6", hasUpvoted && "fill-current")}
                    />
                  </div>
                  <span className="text-white text-sm font-semibold">
                    {upvoteCount}
                  </span>
                </button>

                {/* Bookmark (Scout only) */}
                {userRole === 'scout' && (
                  <button
                    onClick={handleBookmark}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className={cn(
                      "rounded-full p-3 transition-all duration-200",
                      isBookmarked
                        ? "bg-yellow-600 text-white"
                        : "bg-white/15 backdrop-blur-sm text-white hover:bg-white/25"
                    )}>
                      <Bookmark
                        className={cn("h-6 w-6", isBookmarked && "fill-current")}
                      />
                    </div>
                    <span className="text-white text-xs">
                      {isBookmarked ? 'Saved' : 'Save'}
                    </span>
                  </button>
                )}

                {/* Contact (Scout only) */}
                {userRole === 'scout' && (
                  <button
                    onClick={handleContact}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="rounded-full p-3 bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-all duration-200">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <span className="text-white text-xs">Contact</span>
                  </button>
                )}
              </>
            )}

            {/* Share (always visible) */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="rounded-full p-3 bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-all duration-200">
                <Share2 className="h-6 w-6" />
              </div>
              <span className="text-white text-xs">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Touch swipe hint (mobile) */}
      <div className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-bounce">
        Swipe up for next
      </div>
    </div>
  );
}
