"use client"

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  POPULAR_SPORTS,
  SPORT_LEVELS,
  REGION_SCOPES,
  US_REGIONS,
} from '@/lib/discovery/constants'
import type { UserDiscoveryPreferences, SportLevel } from '@/lib/discovery/types'

interface DiscoverySettingsProps {
  preferences: UserDiscoveryPreferences
  onClose: () => void
  onSave: (preferences: UserDiscoveryPreferences) => void
}

export function DiscoverySettings({ preferences, onClose, onSave }: DiscoverySettingsProps) {
  const [favoriteSports, setFavoriteSports] = useState(preferences.favoriteSports)
  const [preferredLevels, setPreferredLevels] = useState(preferences.preferredLevels)
  const [regionScope, setRegionScope] = useState(preferences.regionScope)
  const [preferredRegions, setPreferredRegions] = useState(preferences.preferredRegions)
  const [showWholesome, setShowWholesome] = useState(preferences.showWholesome)
  const [showNsfw, setShowNsfw] = useState(preferences.showNsfw)
  const [autoPlay, setAutoPlay] = useState(preferences.autoPlay)
  const [showLiveStreams, setShowLiveStreams] = useState(preferences.showLiveStreams)

  const toggleSport = (sportId: string) => {
    setFavoriteSports(prev =>
      prev.includes(sportId) ? prev.filter(s => s !== sportId) : [...prev, sportId]
    )
  }

  const toggleLevel = (level: SportLevel) => {
    setPreferredLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const toggleRegion = (region: string) => {
    setPreferredRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    )
  }

  const handleSave = () => {
    const updatedPreferences: UserDiscoveryPreferences = {
      ...preferences,
      favoriteSports,
      preferredLevels,
      regionScope,
      preferredRegions,
      showWholesome,
      showNsfw,
      autoPlay,
      showLiveStreams,
      contentRatings: ['sfw', ...(showWholesome ? ['wholesome' as const] : []), ...(showNsfw ? ['nsfw' as const] : [])],
      updatedAt: new Date().toISOString(),
    }

    onSave(updatedPreferences)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white">Discovery Settings</h2>
                <p className="text-sm text-white/60 mt-1">Customize your feed preferences</p>
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

            {/* Content */}
            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {/* Sports */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Favorite Sports</h3>
                  <p className="text-sm text-white/60">Choose which sports appear in your feed</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {POPULAR_SPORTS.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => toggleSport(sport.id)}
                      className={cn(
                        "relative p-3 rounded-xl border-2 transition-all duration-300",
                        favoriteSports.includes(sport.id)
                          ? "border-sport-blue bg-sport-blue/20 scale-105"
                          : "border-white/10 bg-white/5 hover:border-white/30 hover:scale-105"
                      )}
                    >
                      {favoriteSports.includes(sport.id) && (
                        <div className="absolute -top-2 -right-2 rounded-full bg-sport-blue p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="text-center space-y-1">
                        <div className="text-2xl">{sport.icon}</div>
                        <p className="text-xs font-medium text-white">{sport.name}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {favoriteSports.length === 0 && (
                  <p className="text-sm text-yellow-400 text-center">
                    No sports selected - you&apos;ll see content from all sports
                  </p>
                )}
              </div>

              <div className="h-px bg-white/10" />

              {/* Levels */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Competition Levels</h3>
                  <p className="text-sm text-white/60">From youth leagues to the pros</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {SPORT_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => toggleLevel(level.value)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
                        preferredLevels.includes(level.value)
                          ? "border-sport-green bg-sport-green/20 scale-105"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      )}
                    >
                      {preferredLevels.includes(level.value) && (
                        <div className="absolute top-3 right-3 rounded-full bg-sport-green p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <p className="text-sm font-bold text-white">{level.label}</p>
                      <p className="text-xs text-white/60 mt-1">{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Region */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Region</h3>
                  <p className="text-sm text-white/60">Where do you want to see content from?</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {REGION_SCOPES.map((scope) => (
                    <button
                      key={scope.value}
                      onClick={() => setRegionScope(scope.value)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all duration-300",
                        regionScope === scope.value
                          ? "border-sport-orange bg-sport-orange/20 scale-105"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      )}
                    >
                      <p className="text-xs font-bold text-white">{scope.label}</p>
                    </button>
                  ))}
                </div>

                {regionScope !== 'international' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {US_REGIONS.map((region) => (
                      <button
                        key={region.value}
                        onClick={() => toggleRegion(region.value)}
                        className={cn(
                          "p-2 rounded-lg border transition-all",
                          preferredRegions.includes(region.value)
                            ? "border-sport-blue bg-sport-blue/20 text-white"
                            : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                        )}
                      >
                        <p className="text-xs font-medium">{region.label}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-white/10" />

              {/* Content & Playback */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Content & Playback</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <Label className="text-white font-semibold">Wholesome Content 💝</Label>
                      <p className="text-xs text-white/60 mt-1">Heartwarming and inspiring moments</p>
                    </div>
                    <Switch checked={showWholesome} onCheckedChange={setShowWholesome} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <Label className="text-white font-semibold">NSFW Content ⚠️</Label>
                      <p className="text-xs text-white/60 mt-1">Combat sports and intense moments</p>
                    </div>
                    <Switch checked={showNsfw} onCheckedChange={setShowNsfw} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <Label className="text-white font-semibold">Auto-play Videos</Label>
                      <p className="text-xs text-white/60 mt-1">Videos start automatically</p>
                    </div>
                    <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <Label className="text-white font-semibold">Show Live Streams</Label>
                      <p className="text-xs text-white/60 mt-1">See ongoing games and events</p>
                    </div>
                    <Switch checked={showLiveStreams} onCheckedChange={setShowLiveStreams} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                Cancel
              </Button>

              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-sport-blue to-sport-green hover:from-sport-blue/80 hover:to-sport-green/80 text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
