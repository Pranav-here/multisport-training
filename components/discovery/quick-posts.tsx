"use client"

import { Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface QuickPost {
  id: string
  athleteName: string
  athleteAvatar: string
  athleteUsername: string
  sport: string
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  isVerified?: boolean
  isTrending?: boolean
}

const MOCK_QUICK_POSTS: QuickPost[] = [
  {
    id: 'post-1',
    athleteName: 'Sarah Chen',
    athleteAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    athleteUsername: '@sarahhoops',
    sport: 'Basketball',
    content: 'Just hit 100 three-pointers in practice! 💪🏀 Coach says I\'m ready for the championship game. Let\'s get it!',
    timestamp: '2m ago',
    likes: 247,
    comments: 12,
    shares: 5,
    isVerified: true,
    isTrending: true,
  },
  {
    id: 'post-2',
    athleteName: 'Marcus Williams',
    athleteAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    athleteUsername: '@mwill_soccer',
    sport: 'Soccer',
    content: 'Shoutout to my team for the W today! 3-1 victory and I got to assist the game-winner ⚽🔥',
    timestamp: '15m ago',
    likes: 189,
    comments: 8,
    shares: 3,
  },
  {
    id: 'post-3',
    athleteName: 'Emma Rodriguez',
    athleteAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    athleteUsername: '@emma_runs',
    sport: 'Track',
    content: 'New PR today! 11.2s in the 100m dash. All those early morning workouts are finally paying off 🏃‍♀️⚡',
    timestamp: '1h ago',
    likes: 342,
    comments: 23,
    shares: 9,
    isVerified: true,
  },
  {
    id: 'post-4',
    athleteName: 'Jake Thompson',
    athleteAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jake',
    athleteUsername: '@jthompson_bb',
    sport: 'Baseball',
    content: 'College scouts in the stands today... no pressure 😅 Just gonna play my game and trust the process!',
    timestamp: '3h ago',
    likes: 156,
    comments: 17,
    shares: 4,
    isTrending: true,
  },
]

export function QuickPosts() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  return (
    <div className="absolute top-44 left-0 right-0 z-30 px-4 pb-32">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white/80">Quick Updates</h3>
          <button className="text-xs text-white/60 hover:text-white transition-colors">
            See all
          </button>
        </div>

        {/* Horizontal scrolling container */}
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
          {MOCK_QUICK_POSTS.map((post) => {
            const isLiked = likedPosts.has(post.id)

            return (
              <div
                key={post.id}
                className="group relative flex-none w-80 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-4 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
              >
                {post.isTrending && (
                  <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-white" />
                    <span className="text-xs font-bold text-white">Trending</span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage src={post.athleteAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-sport-blue to-sport-green text-white font-bold">
                      {post.athleteName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-white text-sm truncate">
                        {post.athleteName}
                      </p>
                      {post.isVerified && (
                        <svg className="h-4 w-4 text-sport-blue" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-white/60">{post.athleteUsername}</p>
                      <span className="text-white/40">·</span>
                      <p className="text-xs text-white/60">{post.timestamp}</p>
                    </div>
                  </div>

                  <Badge variant="secondary" className="bg-white/10 text-white text-xs border-0">
                    {post.sport}
                  </Badge>
                </div>

                {/* Content */}
                <p className="text-white text-sm leading-relaxed mb-3">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-6 text-white/60">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1 transition-all hover:scale-110 ${
                      isLiked ? 'text-red-500' : 'hover:text-red-400'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">
                      {isLiked ? post.likes + 1 : post.likes}
                    </span>
                  </button>

                  <button className="flex items-center gap-1 hover:text-sport-blue transition-all hover:scale-110">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">{post.comments}</span>
                  </button>

                  <button className="flex items-center gap-1 hover:text-sport-green transition-all hover:scale-110">
                    <Share2 className="h-4 w-4" />
                    <span className="text-xs font-medium">{post.shares}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
