"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share, Bookmark, Flag, Play, MoreHorizontal, MapPin, Clock, Zap } from "lucide-react"
import type { Post } from "@/lib/mock-data"

interface VideoCardProps {
  post: Post
  onLike?: (postId: string) => void
  onSave?: (postId: string) => void
  onShare?: (postId: string) => void
  onFlag?: (postId: string) => void
}

export function VideoCard({ post, onLike, onSave, onShare, onFlag }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

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
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{post.location}</span>
                  </div>
                  <span>•</span>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Video/Thumbnail */}
        <div className="relative aspect-[4/5] bg-muted">
          <img
            src={post.thumbnail || "/placeholder.svg"}
            alt={post.caption}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/sports-training-video.png"
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
          </div>
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
