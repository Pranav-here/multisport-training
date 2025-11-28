"use client"

import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  icon: React.ReactNode
  count?: number
  label?: string
  active?: boolean
  onClick: () => void
  variant?: 'default' | 'special'
}

function ActionButton({ icon, count, label, active, onClick, variant = 'default' }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group transition-transform duration-200 ease-out hover:scale-110 active:scale-95"
    >
      <div
        className={cn(
          'rounded-full p-3 transition-all duration-300 ease-out shadow-lg backdrop-blur-md',
          variant === 'special'
            ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/40 hover:from-yellow-500/40 hover:to-orange-500/40'
            : active
            ? 'bg-red-600 text-white scale-110'
            : 'bg-black/60 text-white hover:bg-black/80 border border-white/20'
        )}
      >
        {icon}
      </div>
      {count !== undefined && (
        <span className="text-white text-xs font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-opacity duration-200">
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
      {label && (
        <span className="text-white text-[10px] font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-opacity duration-200">
          {label}
        </span>
      )}
    </button>
  )
}

interface RightActionRailProps {
  upvotes: number
  comments: number
  shares: number
  cheerCount?: number
  hasUpvoted: boolean
  isBookmarked: boolean
  showCheer?: boolean
  onUpvote: () => void
  onComment: () => void
  onShare: () => void
  onBookmark: () => void
  onCheer?: () => void
}

export function RightActionRail({
  upvotes,
  comments,
  shares,
  cheerCount = 0,
  hasUpvoted,
  isBookmarked,
  showCheer = true,
  onUpvote,
  onComment,
  onShare,
  onBookmark,
  onCheer,
}: RightActionRailProps) {
  return (
    <div className="absolute right-3 sm:right-5 bottom-32 sm:bottom-28 z-30 flex flex-col items-center gap-3.5">
      {/* Like */}
      <ActionButton
        icon={
          <Heart
            className={cn('h-6 w-6', hasUpvoted && 'fill-current animate-pulse')}
          />
        }
        count={upvotes}
        active={hasUpvoted}
        onClick={onUpvote}
      />

      {/* Comments */}
      <ActionButton
        icon={<MessageCircle className="h-6 w-6" />}
        count={comments}
        onClick={onComment}
      />

      {/* Cheer - shows count like other icons */}
      {showCheer && onCheer && (
        <ActionButton
          icon={<span className="text-2xl leading-none">🏆</span>}
          count={cheerCount}
          onClick={onCheer}
          variant="special"
        />
      )}

      {/* Bookmark */}
      <ActionButton
        icon={
          <Bookmark
            className={cn('h-6 w-6', isBookmarked && 'fill-current')}
          />
        }
        active={isBookmarked}
        onClick={onBookmark}
      />

      {/* Share */}
      <ActionButton
        icon={<Share2 className="h-6 w-6" />}
        count={shares}
        onClick={onShare}
      />
    </div>
  )
}
