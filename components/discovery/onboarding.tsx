"use client"

import { useState } from 'react'
import { Check, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  POPULAR_SPORTS,
  SPORT_LEVELS,
  REGION_SCOPES,
  US_REGIONS,
} from '@/lib/discovery/constants'
import type { UserDiscoveryPreferences, SportLevel, RegionScope, ContentRating } from '@/lib/discovery/types'

interface DiscoveryOnboardingProps {
  onComplete: (preferences: UserDiscoveryPreferences) => void
}

export function DiscoveryOnboarding({ onComplete }: DiscoveryOnboardingProps) {
  const [step, setStep] = useState(1)
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<SportLevel[]>(['high_school', 'college', 'professional'])
  const [regionScope, setRegionScope] = useState<RegionScope>('national')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [contentPrefs, setContentPrefs] = useState({
    showWholesome: true,
    showNsfw: false,
  })

  const totalSteps = 4

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev =>
      prev.includes(sportId) ? prev.filter(s => s !== sportId) : [...prev, sportId]
    )
  }

  const toggleLevel = (level: SportLevel) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    )
  }

  const handleComplete = () => {
    const preferences: UserDiscoveryPreferences = {
      id: 'temp',
      userId: 'temp',
      contentRatings: ['sfw', ...(contentPrefs.showWholesome ? ['wholesome' as ContentRating] : []), ...(contentPrefs.showNsfw ? ['nsfw' as ContentRating] : [])],
      showWholesome: contentPrefs.showWholesome,
      showNsfw: contentPrefs.showNsfw,
      regionScope,
      preferredRegions: selectedRegions,
      favoriteSports: selectedSports,
      favoriteTeams: [],
      preferredLevels: selectedLevels.length > 0 ? selectedLevels : ['high_school', 'college', 'professional'],
      autoPlay: true,
      showLiveStreams: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onComplete(preferences)
  }

  const canContinue = () => {
    switch (step) {
      case 1:
        return selectedSports.length > 0
      case 2:
        return selectedLevels.length > 0
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-black via-sport-blue/10 to-sport-purple/10">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-sport-blue/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-sport-green/20 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 h-full flex flex-col p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-sport-blue to-sport-green p-3">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome to Discovery</h1>
              <p className="text-sm text-white/60">Customize your sports feed</p>
            </div>
          </div>

          {/* Progress */}
          <div className="text-right">
            <p className="text-sm text-white/60">Step {step} of {totalSteps}</p>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    idx < step ? "w-8 bg-sport-blue" : "w-8 bg-white/20"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {/* Step 1: Sports */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">What sports do you love?</h2>
                <p className="text-white/70">Select all the sports you want to see in your feed</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {POPULAR_SPORTS.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport.id)}
                    className={cn(
                      "relative group p-4 rounded-xl border transition-all duration-300",
                      selectedSports.includes(sport.id)
                        ? "border-sport-blue bg-sport-blue/20 scale-105"
                        : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:scale-105"
                    )}
                  >
                    {selectedSports.includes(sport.id) && (
                      <div className="absolute -top-2 -right-2 rounded-full bg-sport-blue p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div className="text-center space-y-2">
                      <div className="text-4xl">{sport.icon}</div>
                      <p className="text-sm font-medium text-white">{sport.name}</p>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-sm text-white/50 text-center">
                {selectedSports.length} sport{selectedSports.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Step 2: Levels */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">What level interests you?</h2>
                <p className="text-white/70">From little league to the pros, choose what you want to watch</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SPORT_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => toggleLevel(level.value)}
                    className={cn(
                      "relative group p-6 rounded-xl border text-left transition-all duration-300",
                      selectedLevels.includes(level.value)
                        ? "border-sport-green bg-sport-green/20 scale-105"
                        : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:scale-105"
                    )}
                  >
                    {selectedLevels.includes(level.value) && (
                      <div className="absolute top-4 right-4 rounded-full bg-sport-green p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-white mb-1">{level.label}</h3>
                    <p className="text-sm text-white/70">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Region */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Where are you from?</h2>
                <p className="text-white/70">See sports content from your area or around the world</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {REGION_SCOPES.map((scope) => (
                    <button
                      key={scope.value}
                      onClick={() => setRegionScope(scope.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-300",
                        regionScope === scope.value
                          ? "border-sport-orange bg-sport-orange/20 scale-105"
                          : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                      )}
                    >
                      <p className="text-sm font-bold text-white mb-1">{scope.label}</p>
                      <p className="text-xs text-white/60">{scope.description}</p>
                    </button>
                  ))}
                </div>

                {regionScope !== 'international' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-white">Select your region(s)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {US_REGIONS.map((region) => (
                        <button
                          key={region.value}
                          onClick={() => toggleRegion(region.value)}
                          className={cn(
                            "p-3 rounded-lg border transition-all duration-200",
                            selectedRegions.includes(region.value)
                              ? "border-sport-blue bg-sport-blue/20 text-white"
                              : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                          )}
                        >
                          <p className="text-sm font-medium">{region.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Content Preferences */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Final touches</h2>
                <p className="text-white/70">Choose what kind of content you want to see</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="wholesome" className="text-white font-semibold">
                        Wholesome Moments 💝
                      </Label>
                      <p className="text-sm text-white/60">
                        Inspiring stories and heartwarming achievements
                      </p>
                    </div>
                    <Switch
                      id="wholesome"
                      checked={contentPrefs.showWholesome}
                      onCheckedChange={(checked) =>
                        setContentPrefs(prev => ({ ...prev, showWholesome: checked }))
                      }
                    />
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="nsfw" className="text-white font-semibold">
                        NSFW Content ⚠️
                      </Label>
                      <p className="text-sm text-white/60">
                        Fighting sports, blood, and intense moments
                      </p>
                    </div>
                    <Switch
                      id="nsfw"
                      checked={contentPrefs.showNsfw}
                      onCheckedChange={(checked) =>
                        setContentPrefs(prev => ({ ...prev, showNsfw: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-sport-blue/30 bg-sport-blue/10 p-6">
                  <h3 className="text-white font-semibold mb-2">You&apos;re all set!</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Your personalized sports feed is ready. You can change these preferences anytime in settings.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedSports.slice(0, 5).map((sportId) => {
                      const sport = POPULAR_SPORTS.find(s => s.id === sportId)
                      return sport ? (
                        <Badge key={sportId} variant="secondary" className="bg-white/10 text-white border-white/20">
                          {sport.icon} {sport.name}
                        </Badge>
                      ) : null
                    })}
                    {selectedSports.length > 5 && (
                      <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                        +{selectedSports.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="text-white hover:bg-white/10"
            >
              Back
            </Button>

            {step === 1 && (
              <Button
                variant="ghost"
                onClick={() => {
                  // Skip onboarding with defaults
                  const defaultPrefs: UserDiscoveryPreferences = {
                    id: 'temp',
                    userId: 'temp',
                    contentRatings: ['sfw', 'wholesome'],
                    showWholesome: true,
                    showNsfw: false,
                    regionScope: 'national',
                    preferredRegions: [],
                    favoriteSports: [],
                    favoriteTeams: [],
                    preferredLevels: ['high_school', 'college', 'professional'],
                    autoPlay: true,
                    showLiveStreams: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                  onComplete(defaultPrefs)
                }}
                className="text-white/60 hover:bg-white/10 hover:text-white"
              >
                Skip for now
              </Button>
            )}
          </div>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue()}
              className="bg-gradient-to-r from-sport-blue to-sport-green hover:from-sport-blue/80 hover:to-sport-green/80 text-white"
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-gradient-to-r from-sport-green to-sport-blue hover:from-sport-green/80 hover:to-sport-blue/80 text-white"
            >
              Start Discovering
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
