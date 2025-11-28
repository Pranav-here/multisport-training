"use client"

import Link from 'next/link'
import { Settings, Sparkles, Play, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DiscoverHeaderProps {
  viewMode: 'reels' | 'live'
  isLiveFeed?: boolean
  onViewModeChange: (mode: 'reels' | 'live') => void
  onSettingsClick: () => void
}

export function DiscoverHeader({
  viewMode,
  isLiveFeed = false,
  onViewModeChange,
  onSettingsClick,
}: DiscoverHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Back to Training button - floating in top-left */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-9 rounded-full border border-white/20 bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-xl px-4 text-white hover:from-black/90 hover:to-black/80 hover:border-white/30 shadow-lg transition-all duration-200 group"
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold tracking-wide uppercase">Back to Training</span>
          </Link>
        </Button>
      </div>

      {/* Main header content */}
      <div className="px-4 pt-safe-4 pb-6 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
        <div className="flex items-center justify-between gap-4 pointer-events-auto pt-2">
          {/* Center: Logo and title */}
          <div className="flex items-center gap-3 min-w-0 mx-auto md:mx-0">
            <Sparkles className="h-6 w-6 text-sport-blue flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">Discover</h1>
              {isLiveFeed && viewMode === 'reels' && (
                <Badge className="bg-red-600 text-white border-0 text-[10px] font-bold px-2 py-0.5 animate-pulse flex-shrink-0">
                  LIVE
                </Badge>
              )}
            </div>
          </div>

        {/* Right: Toggle and settings */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md p-1 border border-white/10">
            <button
              onClick={() => onViewModeChange('reels')}
              aria-pressed={viewMode === 'reels'}
              className={`
                rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2
                ${
                  viewMode === 'reels'
                    ? 'bg-sport-blue text-white shadow-lg shadow-sport-blue/50'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Play className="h-4 w-4 fill-current" />
              <span className="hidden sm:inline">Reels</span>
            </button>
            <button
              onClick={() => onViewModeChange('live')}
              aria-pressed={viewMode === 'live'}
              className={`
                rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2
                ${
                  viewMode === 'live'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">Live</span>
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 border border-white/10 h-10 w-10"
            onClick={onSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
