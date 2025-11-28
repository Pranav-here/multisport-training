"use client"

import { useState } from 'react'
import { Radio, Users, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface LiveStream {
  id: string
  title: string
  provider: string
  sport: string
  viewerCount: number
  thumbnailUrl: string
}

const MOCK_LIVE_STREAMS: LiveStream[] = [
  {
    id: '1',
    title: 'Lakers vs Warriors - NBA Finals',
    provider: 'ESPN',
    sport: 'Basketball',
    viewerCount: 127543,
    thumbnailUrl: '/placeholder.svg',
  },
  {
    id: '2',
    title: 'Champions League: Real Madrid vs Man City',
    provider: 'CBS Sports',
    sport: 'Soccer',
    viewerCount: 89234,
    thumbnailUrl: '/placeholder.svg',
  },
  {
    id: '3',
    title: 'UFC 305: Main Card',
    provider: 'ESPN+',
    sport: 'MMA',
    viewerCount: 54321,
    thumbnailUrl: '/placeholder.svg',
  },
]

export function LiveStreamsBar() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="absolute top-24 left-0 right-0 z-40">
      <div className={cn(
        "mx-4 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-xl transition-all duration-300",
        isExpanded ? "p-4" : "p-2"
      )}>
        {/* Collapsed view */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radio className="h-5 w-5 text-red-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  {MOCK_LIVE_STREAMS.length} Live Now
                </p>
                <p className="text-xs text-white/60">
                  {MOCK_LIVE_STREAMS[0].title}
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-white/60" />
          </button>
        )}

        {/* Expanded view */}
        {isExpanded && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Live Streams</h3>
                <Badge className="bg-red-500 text-white text-xs">
                  {MOCK_LIVE_STREAMS.length}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 text-xs text-white/60 hover:text-white hover:bg-white/10"
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MOCK_LIVE_STREAMS.map((stream) => (
                <button
                  key={stream.id}
                  className="group relative overflow-hidden rounded-xl bg-black/40 border border-white/10 hover:border-red-500/50 transition-all duration-300 hover:scale-105"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-red-900/20 to-orange-900/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Radio className="h-8 w-8 text-red-400 mx-auto mb-2 animate-pulse" />
                        <p className="text-xs text-white/60">LIVE</p>
                      </div>
                    </div>

                    {/* Live indicator */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-red-600 text-white text-xs font-bold flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>

                    {/* Viewer count */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {(stream.viewerCount / 1000).toFixed(1)}K
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                      {stream.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-white/60">{stream.provider}</p>
                      <Badge variant="secondary" className="text-xs bg-white/10 text-white border-0">
                        {stream.sport}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
