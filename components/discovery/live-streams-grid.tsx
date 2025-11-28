"use client"

import { useState } from 'react'
import { Play, Users, TrendingUp, Wifi } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { LiveStream } from '@/lib/discovery/types'

interface LiveStreamsGridProps {
  streams?: LiveStream[]
  onStreamClick?: (stream: LiveStream) => void
}

// Mock live streams
const MOCK_STREAMS: LiveStream[] = [
  {
    id: '1',
    title: 'Lakers vs Warriors - Western Conference Finals',
    description: 'Game 7 - Winner takes all!',
    streamUrl: 'https://example.com/stream1',
    thumbnailUrl: undefined,
    provider: 'ESPN',
    sportName: 'Basketball',
    status: 'live',
    viewerCount: 45823,
    peakViewers: 52000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'High School Championship - Final Quarter',
    description: 'Lincoln High vs Roosevelt High',
    streamUrl: 'https://example.com/stream2',
    thumbnailUrl: undefined,
    provider: 'Local Sports',
    sportName: 'Football',
    status: 'live',
    viewerCount: 3421,
    peakViewers: 4100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'College Soccer: Duke vs UNC',
    description: 'ACC Tournament Semifinals',
    streamUrl: 'https://example.com/stream3',
    thumbnailUrl: undefined,
    provider: 'ESPN+',
    sportName: 'Soccer',
    status: 'live',
    viewerCount: 12543,
    peakViewers: 15200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'NFL Sunday Night Football',
    description: 'Chiefs vs Bills',
    streamUrl: 'https://example.com/stream4',
    thumbnailUrl: undefined,
    provider: 'NBC Sports',
    sportName: 'Football',
    status: 'live',
    viewerCount: 128456,
    peakViewers: 135000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'NBA All-Star Weekend',
    description: '3-Point Contest',
    streamUrl: 'https://example.com/stream5',
    thumbnailUrl: undefined,
    provider: 'TNT',
    sportName: 'Basketball',
    status: 'live',
    viewerCount: 67234,
    peakViewers: 72000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Little League World Series',
    description: 'Championship Game',
    streamUrl: 'https://example.com/stream6',
    thumbnailUrl: undefined,
    provider: 'ABC Sports',
    sportName: 'Baseball',
    status: 'live',
    viewerCount: 23145,
    peakViewers: 28000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function LiveStreamsGrid({ streams = MOCK_STREAMS, onStreamClick }: LiveStreamsGridProps) {
  const [selectedStream, setSelectedStream] = useState<string | null>(null)

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const handleStreamClick = (stream: LiveStream) => {
    setSelectedStream(stream.id)
    onStreamClick?.(stream)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-red-500 animate-pulse" />
          <h2 className="text-xl font-bold text-white">Live Now</h2>
          <Badge variant="secondary" className="bg-red-600/20 text-red-400 border-red-500/30">
            {streams.filter(s => s.status === 'live').length} Streams
          </Badge>
        </div>

        <button className="text-sm text-sport-blue hover:text-sport-blue/80 font-medium transition-colors">
          View All
        </button>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 px-4 pb-2">
          {streams.map((stream) => (
            <button
              key={stream.id}
              onClick={() => handleStreamClick(stream)}
              className={cn(
                "relative flex-shrink-0 w-72 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95",
                selectedStream === stream.id && "ring-2 ring-sport-blue"
              )}
            >
              {/* Thumbnail / Video preview */}
              <div className="aspect-video bg-gradient-to-br from-sport-blue/20 via-sport-purple/20 to-sport-orange/20 relative">
                {/* Live indicator */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-red-600 text-white border-0 font-bold animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    LIVE
                  </Badge>
                </div>

                {/* Viewer count */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                    <Users className="h-3 w-3 text-white" />
                    <span className="text-xs font-bold text-white">
                      {formatViewerCount(stream.viewerCount)}
                    </span>
                  </div>
                </div>

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-white/20 backdrop-blur-sm p-4">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>

                {/* Sport icon */}
                <div className="absolute bottom-3 left-3 z-10">
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-white border-white/20 text-xs">
                    {stream.sportName}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-sm">
                <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 group-hover:text-sport-blue transition-colors">
                  {stream.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stream.provider}
                  </span>
                  {stream.description && (
                    <span className="truncate ml-2">{stream.description}</span>
                  )}
                </div>

                {/* Peak viewers */}
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Peak Viewers:</span>
                    <span className="text-white/70 font-semibold">
                      {formatViewerCount(stream.peakViewers)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
