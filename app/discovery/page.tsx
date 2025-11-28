"use client"

import { useState, useEffect, useMemo } from 'react'
import { Play } from 'lucide-react'
import { ReelsFeed } from '@/components/discovery/reels-feed'
import { DiscoveryOnboarding } from '@/components/discovery/onboarding'
import { DiscoverySettings } from '@/components/discovery/settings'
import { LiveStreamsGrid } from '@/components/discovery/live-streams-grid'
import { DiscoverHeader } from '@/components/discovery/discover-header'
import { MOCK_DISCOVERY_CLIPS } from '@/lib/discovery/mock-clips'
import { DEFAULT_PREFERENCES } from '@/lib/discovery/constants'
import type { UserDiscoveryPreferences, DiscoveryClip } from '@/lib/discovery/types'

const ONBOARDING_KEY = 'discovery_onboarding_completed'
const PREFERENCES_KEY = 'discovery_preferences'

type ViewMode = 'reels' | 'live'

export default function DiscoveryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('reels')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<UserDiscoveryPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  // Load preferences and check onboarding status
  useEffect(() => {
    const onboardingComplete = localStorage.getItem(ONBOARDING_KEY)
    const savedPrefs = localStorage.getItem(PREFERENCES_KEY)

    if (!onboardingComplete) {
      setShowOnboarding(true)
      setLoading(false)
    } else if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs))
      setLoading(false)
    } else {
      // Create default preferences
      const defaultPrefs: UserDiscoveryPreferences = {
        id: 'temp',
        userId: 'temp',
        ...DEFAULT_PREFERENCES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as UserDiscoveryPreferences
      setPreferences(defaultPrefs)
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(defaultPrefs))
      setLoading(false)
    }
  }, [])

  // Filter clips based on preferences
  const filteredClips = useMemo<DiscoveryClip[]>(() => {
    if (!preferences) return MOCK_DISCOVERY_CLIPS

    return MOCK_DISCOVERY_CLIPS.filter(clip => {
      // Filter by sport
      if (preferences.favoriteSports.length > 0 && !preferences.favoriteSports.includes(clip.sport.toLowerCase())) {
        return false
      }

      // Filter by sport level
      if (preferences.preferredLevels.length > 0 && clip.sportLevel && !preferences.preferredLevels.includes(clip.sportLevel)) {
        return false
      }

      // Filter by region
      if (preferences.regionScope !== 'international') {
        if (preferences.preferredRegions.length > 0 && clip.region && !preferences.preferredRegions.includes(clip.region)) {
          return false
        }
      }

      // Filter by content rating
      if (!preferences.showWholesome && clip.isWholesome) {
        return false
      }

      if (!preferences.showNsfw && clip.contentRating === 'nsfw') {
        return false
      }

      // Don't filter sponsored content
      if (clip.isSponsored) {
        return true
      }

      return true
    })
  }, [preferences])

  const handleOnboardingComplete = (prefs: UserDiscoveryPreferences) => {
    setPreferences(prefs)
    localStorage.setItem(ONBOARDING_KEY, 'true')
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
    setShowOnboarding(false)
  }

  const handlePreferencesUpdate = (prefs: UserDiscoveryPreferences) => {
    setPreferences(prefs)
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
    setShowSettings(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sport-blue border-t-transparent" />
          <p className="text-sm text-white/60">Loading your discovery feed...</p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return <DiscoveryOnboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Header - shared across both modes */}
      <DiscoverHeader
        viewMode={viewMode}
        isLiveFeed={true}
        onViewModeChange={setViewMode}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Content */}
      {viewMode === 'reels' ? (
        <ReelsFeed
          clips={filteredClips}
          autoPlay={preferences?.autoPlay ?? true}
          onClipChange={(index) => {
            // Track analytics here
          }}
        />
      ) : (
        <div className="h-full pt-20 px-4 overflow-y-auto bg-gradient-to-b from-black via-black to-gray-900">
          <LiveStreamsGrid />

          {/* Coming soon message */}
          <div className="max-w-4xl mx-auto py-12 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 mb-4">
                <Play className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">More Live Streams Coming Soon</h2>
              <p className="text-white/60">
                We're partnering with ESPN, NBC Sports, and more to bring you live sports from around the world
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && preferences && (
        <DiscoverySettings
          preferences={preferences}
          onClose={() => setShowSettings(false)}
          onSave={handlePreferencesUpdate}
        />
      )}

      {/* Clip counter - at very bottom center */}
      {viewMode === 'reels' && filteredClips.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
          <p className="text-[11px] text-white/70 font-medium tracking-wide">
            {filteredClips.length} {filteredClips.length === 1 ? 'clip' : 'clips'} in your feed
          </p>
        </div>
      )}

      {/* Debug: Reset onboarding (dev only) - minimized */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            localStorage.removeItem(ONBOARDING_KEY)
            localStorage.removeItem(PREFERENCES_KEY)
            window.location.reload()
          }}
          title="Reset Onboarding (Dev Only)"
          className="absolute bottom-14 right-3 z-50 h-7 w-7 rounded-full bg-black/20 text-white/30 text-[10px] border border-white/10 hover:bg-black/40 hover:text-white/60 transition-all flex items-center justify-center"
        >
          ↺
        </button>
      )}
    </div>
  )
}
