"use client"

import { useState } from 'react'
import { X, Search, Crown, Sparkles, Flame, Trophy, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { CheerBadge } from '@/lib/discovery/types'

interface EmojiBadgePickerProps {
  open: boolean
  onClose: () => void
  onBadgeSelect: (badge: CheerBadge) => void
}

// Mock badges with different rarities and categories
const MOCK_BADGES: CheerBadge[] = [
  // Common badges
  { id: '1', name: 'Fire', slug: 'fire', emoji: '🔥', rarity: 'common' },
  { id: '2', name: 'Clap', slug: 'clap', emoji: '👏', rarity: 'common' },
  { id: '3', name: 'Strong', slug: 'strong', emoji: '💪', rarity: 'common' },
  { id: '4', name: 'Heart', slug: 'heart', emoji: '❤️', rarity: 'common' },
  { id: '5', name: 'Star', slug: 'star', emoji: '⭐', rarity: 'common' },
  { id: '6', name: 'Rocket', slug: 'rocket', emoji: '🚀', rarity: 'common' },

  // Rare badges
  { id: '7', name: 'Champion', slug: 'champion', emoji: '🏆', rarity: 'rare', sportId: undefined },
  { id: '8', name: 'MVP', slug: 'mvp', emoji: '👑', rarity: 'rare' },
  { id: '9', name: 'Clutch', slug: 'clutch', emoji: '💎', rarity: 'rare' },
  { id: '10', name: 'Beast Mode', slug: 'beast', emoji: '🦁', rarity: 'rare' },

  // Epic badges (team-specific)
  { id: '11', name: 'Warriors Fan', slug: 'warriors', emoji: '💙💛', rarity: 'epic', teamId: 'warriors' },
  { id: '12', name: 'Lakers Nation', slug: 'lakers', emoji: '💜💛', rarity: 'epic', teamId: 'lakers' },
  { id: '13', name: 'Bulls Fan', slug: 'bulls', emoji: '🔴⚫', rarity: 'epic', teamId: 'bulls' },
  { id: '14', name: 'Celtics Pride', slug: 'celtics', emoji: '☘️🍀', rarity: 'epic', teamId: 'celtics' },

  // Legendary badges (region-specific)
  { id: '15', name: 'Midwest Legend', slug: 'midwest', emoji: '🌾🏀', rarity: 'legendary', region: 'midwest' },
  { id: '16', name: 'West Coast Elite', slug: 'west-coast', emoji: '🌊🏆', rarity: 'legendary', region: 'west' },
  { id: '17', name: 'East Coast Beast', slug: 'east-coast', emoji: '🏙️💪', rarity: 'legendary', region: 'northeast' },
  { id: '18', name: 'Southern Fire', slug: 'southern', emoji: '🔥🏈', rarity: 'legendary', region: 'south' },
]

const rarityConfig = {
  common: {
    label: 'Common',
    icon: Star,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
  },
  rare: {
    label: 'Rare',
    icon: Sparkles,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  epic: {
    label: 'Epic',
    icon: Flame,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
  },
  legendary: {
    label: 'Legendary',
    icon: Crown,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
  },
}

export function EmojiBadgePicker({ open, onClose, onBadgeSelect }: EmojiBadgePickerProps) {
  const [selectedRarity, setSelectedRarity] = useState<CheerBadge['rarity'] | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBadges = MOCK_BADGES.filter(badge => {
    const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.slug.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRarity && matchesSearch
  })

  const groupedBadges = filteredBadges.reduce((acc, badge) => {
    if (!acc[badge.rarity]) {
      acc[badge.rarity] = []
    }
    acc[badge.rarity].push(badge)
    return acc
  }, {} as Record<CheerBadge['rarity'], CheerBadge[]>)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Picker modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-2xl mx-auto animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Cheer Badges</h3>
                <p className="text-sm text-white/60 mt-1">Show your support with a badge</p>
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search badges..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sport-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Rarity filters */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRarity('all')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedRarity === 'all'
                    ? "bg-sport-blue text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                )}
              >
                All Badges
              </button>
              {Object.entries(rarityConfig).map(([rarity, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={rarity}
                    onClick={() => setSelectedRarity(rarity as CheerBadge['rarity'])}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      selectedRarity === rarity
                        ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Badges grid */}
          <ScrollArea className="flex-1 p-6">
            {filteredBadges.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No badges found</p>
                <p className="text-sm text-white/40 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedBadges)
                  .sort((a, b) => {
                    const order = ['legendary', 'epic', 'rare', 'common']
                    return order.indexOf(a[0]) - order.indexOf(b[0])
                  })
                  .map(([rarity, badges]) => {
                    const config = rarityConfig[rarity as CheerBadge['rarity']]
                    const Icon = config.icon
                    return (
                      <div key={rarity}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={cn("h-5 w-5", config.color)} />
                          <h4 className={cn("font-bold", config.color)}>{config.label}</h4>
                          <Badge variant="secondary" className="bg-white/5 text-white/60 text-xs">
                            {badges.length}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {badges.map((badge) => (
                            <button
                              key={badge.id}
                              onClick={() => onBadgeSelect(badge)}
                              className={cn(
                                "relative group p-4 rounded-xl border-2 transition-all duration-200 hover:scale-110 active:scale-95",
                                config.bgColor,
                                config.borderColor,
                                "hover:shadow-lg"
                              )}
                            >
                              <div className="text-center">
                                <div className="text-4xl mb-2">{badge.emoji}</div>
                                <p className="text-xs font-medium text-white truncate">
                                  {badge.name}
                                </p>
                              </div>

                              {/* Hover effect */}
                              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <p className="text-white/60">
                Earn rare badges by supporting your teams and regions
              </p>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
