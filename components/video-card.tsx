"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Flag,
  Play,
  MoreHorizontal,
  MapPin,
  Clock,
  Zap,
  Trash2,
  Link2,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Post } from "@/lib/mock-data"

interface VideoCardProps {
  post: Post
  onLike?: (postId: string) => void
  onSave?: (postId: string) => void
  onShare?: (postId: string) => void
  onFlag?: (postId: string) => void
  onDelete?: (postId: string) => void | Promise<void>
}

export function VideoCard({ post, onLike, onSave, onShare, onFlag, onDelete }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [thumbnailSrc, setThumbnailSrc] = useState(post.thumbnail || '/placeholder.svg')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setThumbnailSrc(post.thumbnail || '/placeholder.svg')
    setIsPlaying(false)
    setIsMuted(false)
    if (videoRef.current) {
      videoRef.current.pause()
      try {
        videoRef.current.currentTime = 0
      } catch {
        // Ignore if browser blocks resetting the time.
      }
    }
  }, [post.thumbnail, post.videoUrl, post.id])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  useEffect(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.play().catch((error) => {
        console.warn("Video playback failed", error)
        toast({
          title: "Playback blocked",
          description: "Tap play again to start the clip with audio.",
        })
        setIsPlaying(false)
      })
    } else {
      videoRef.current.pause()
    }
  }, [isPlaying, toast])

  const handleThumbnailError = () => {
    if (thumbnailSrc !== '/sports-training-video.png') {
      setThumbnailSrc('/sports-training-video.png')
    }
  }

  const handleLike = () => {
    onLike?.(post.id)
  }

  const handleSave = () => {
    onSave?.(post.id)
  }

  const handleShare = () => {
    onShare?.(post.id)
  }

  const handleFlag = () => {
    onFlag?.(post.id)
  }

  const handleDelete = async () => {
    if (!onDelete) return

    const confirmed = window.confirm("Delete this post? This action cannot be undone.")
    if (!confirmed) return

    try {
      await onDelete(post.id)
    } catch (error) {
      console.error("Failed to delete post", error)
      toast({
        title: "Delete failed",
        description: "We couldn't remove this post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast({
        title: "Copy unavailable",
        description: "Clipboard access is not supported in this browser.",
        variant: "destructive",
      })
      return
    }

    const shareUrl = `${window.location.origin}/dashboard?post=${post.id}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied",
        description: "Share this highlight with your friends.",
      })
    } catch (error) {
      console.error("Failed to copy post link", error)
      toast({
        title: "Copy failed",
        description: "We couldn't copy the link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getSportColor = (sport: string) => {
    switch (sport.toLowerCase()) {
      case "soccer":
        return "text-sport-green"
      case "basketball":
        return "text-sport-orange"
      case "volleyball":
      case "tennis":
        return "text-sport-blue"
      default:
        return "text-primary"
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.userAvatar || "/placeholder.svg"} alt={post.userName} />
                <AvatarFallback>
                  {post.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{post.userName}</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className={getSportColor(post.sport)}>{post.sport}</span>
                  <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-muted-foreground/50" />
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{post.location}</span>
                  </div>
                  <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-muted-foreground/50" />
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleFlag}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report content
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Copy link
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Video/Thumbnail */}
        <div className="relative aspect-[4/5] bg-muted">
          {post.videoUrl ? (
            <video
              src={post.videoUrl}
              poster={post.thumbnail || "/sports-training-video.png"}
              className="w-full h-full object-cover"
              playsInline
              loop
              preload="metadata"
              ref={(el) => {
                videoRef.current = el
                if (!el) return
                el.muted = isMuted
                if (isPlaying) el.play().catch(() => {})
                else el.pause()
              }}
              onMouseLeave={() => setIsPlaying(false)}
            />
          ) : (
            <Image
              src={thumbnailSrc}
              alt={post.caption || 'Training clip thumbnail'}
              fill
              className='object-cover'
              sizes='(min-width: 1024px) 640px, (min-width: 768px) 50vw, 100vw'
              onError={handleThumbnailError}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 text-white hover-pop"
              onClick={() => {
                // toggle play state
                setIsPlaying((s) => !s)
              }}
            >
              <Play className="h-6 w-6 ml-0.5" />
            </Button>
          </div>
          {post.videoUrl && (
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setIsMuted((m) => !m)}
                aria-label={isMuted ? "Unmute clip" : "Mute clip"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {post.duration}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm mb-3 text-balance">{post.caption}</p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${post.isLiked ? "text-red-500" : ""}`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
                <span className="text-xs">{post.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">{post.comments}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleShare}>
                <Share className="h-4 w-4 mr-1" />
                <span className="text-xs">{post.shares}</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${post.isSaved ? "text-yellow-500" : ""}`}
              onClick={handleSave}
            >
              <Bookmark className={`h-4 w-4 ${post.isSaved ? "fill-current" : ""}`} />
            </Button>
          </div>

          {/* Try This Drill Button */}
          {post.drillId && (
            <div className="mt-3 pt-3 border-t">
              <Link href={`/drills/${post.drillId}`}>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Zap className="h-4 w-4 mr-2" />
                  Try this drill
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
