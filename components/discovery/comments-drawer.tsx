"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Send, Heart, MoreVertical, Flag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { DiscoveryClip, Comment } from '@/lib/discovery/types'

interface CommentsDrawerProps {
  open: boolean
  onClose: () => void
  clip: DiscoveryClip
  onCommentAdded?: () => void
}

export function CommentsDrawer({ open, onClose, clip, onCommentAdded }: CommentsDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Mock comments for demo
  useEffect(() => {
    if (open) {
      setComments([
        {
          id: '1',
          clipId: clip.id,
          userId: 'user1',
          content: 'This is incredible! What a play! 🔥',
          isHidden: false,
          isPinned: false,
          flaggedCount: 0,
          likesCount: 124,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          user: {
            id: 'user1',
            displayName: 'Sarah Johnson',
            username: 'sarah_hoops',
            avatarUrl: undefined,
          },
        },
        {
          id: '2',
          clipId: clip.id,
          userId: 'user2',
          content: 'Future NBA star right here 👀',
          isHidden: false,
          isPinned: false,
          flaggedCount: 0,
          likesCount: 89,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString(),
          user: {
            id: 'user2',
            displayName: 'Mike Davis',
            username: 'coach_mike',
            avatarUrl: undefined,
          },
        },
        {
          id: '3',
          clipId: clip.id,
          userId: 'user3',
          content: 'The footwork is absolutely perfect. This is what dedication looks like.',
          isHidden: false,
          isPinned: false,
          flaggedCount: 0,
          likesCount: 256,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          user: {
            id: 'user3',
            displayName: 'Coach Thompson',
            username: 'thompson_training',
            avatarUrl: undefined,
          },
        },
      ])

      // Focus input when drawer opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, clip.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockComment: Comment = {
      id: `comment-${Date.now()}`,
      clipId: clip.id,
      userId: 'current-user',
      content: newComment,
      isHidden: false,
      isPinned: false,
      flaggedCount: 0,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'current-user',
        displayName: 'You',
        username: 'your_username',
        avatarUrl: undefined,
      },
    }

    setComments(prev => [mockComment, ...prev])
    setNewComment('')
    setIsSubmitting(false)
    onCommentAdded?.()

    toast({
      title: 'Comment posted! 💬',
      description: 'Your comment is live',
    })
  }

  const handleLikeComment = (commentId: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, likesCount: c.likesCount + 1 }
          : c
      )
    )
  }

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return `${Math.floor(seconds / 604800)}w ago`
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900 to-black rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300",
        "max-h-[85vh] flex flex-col"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">Comments</h3>
            <p className="text-sm text-white/60">{comments.length} comments</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Comments list */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No comments yet</p>
                <p className="text-sm text-white/40 mt-1">Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={comment.user.avatarUrl} />
                    <AvatarFallback className="bg-sport-blue text-white text-sm">
                      {comment.user.displayName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white text-sm">
                        {comment.user.displayName}
                      </span>
                      <span className="text-xs text-white/50">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-white/90 text-sm mt-1 leading-relaxed">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center gap-1 text-white/60 hover:text-red-400 transition-colors"
                      >
                        <Heart className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          {comment.likesCount > 0 && comment.likesCount}
                        </span>
                      </button>
                      <button className="text-xs text-white/60 hover:text-white transition-colors font-medium">
                        Reply
                      </button>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Comment input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-sport-blue text-white text-sm">
                Y
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 pr-12 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sport-blue focus:border-transparent"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-sport-blue hover:bg-sport-blue/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
