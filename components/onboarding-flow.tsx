'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Trophy,
  Target,
  Users,
  TrendingUp,
  ArrowRight,
  Check,
  Video,
  Zap,
  Globe,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
}

interface OnboardingData {
  sports: string[]
  displayName: string
  username: string
  location: string
  teamClub?: string
  bio: string
  skillLevel: string
  privacy: 'public' | 'followers' | 'private'
  scoutVisible: boolean
  safeRecording: boolean
  dataConsent: boolean
  goals: {
    weeklySessions: number
    primarySport: string
  }
  preferredMode: 'training' | 'discovery'
}

const SPORTS = [
  {
    id: 'soccer',
    name: 'Soccer',
    emoji: '⚽',
    borderColor: 'from-emerald-500 via-lime-400 to-emerald-500'
  },
  {
    id: 'basketball',
    name: 'Basketball',
    emoji: '🏀',
    borderColor: 'from-orange-500 via-amber-400 to-orange-500'
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    emoji: '🏐',
    borderColor: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'football',
    name: 'Football',
    emoji: '🏈',
    borderColor: 'from-amber-600 via-orange-500 to-amber-600'
  },
  {
    id: 'baseball',
    name: 'Baseball',
    emoji: '⚾',
    borderColor: 'from-cyan-500 via-sky-400 to-cyan-500'
  },
  {
    id: 'tennis',
    name: 'Tennis',
    emoji: '🎾',
    borderColor: 'from-yellow-500 via-lime-400 to-emerald-400'
  },
  {
    id: 'cricket',
    name: 'Cricket',
    emoji: '🏏',
    borderColor: 'from-rose-500 via-red-400 to-rose-500'
  },
  {
    id: 'rugby',
    name: 'Rugby',
    emoji: '🏉',
    borderColor: 'from-lime-500 via-emerald-400 to-lime-500'
  },
  {
    id: 'track',
    name: 'Track & Field',
    emoji: '🏃',
    borderColor: 'from-purple-500 to-violet-600'
  },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [skillLevel, setSkillLevel] = useState('intermediate')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [location, setLocation] = useState('')
  const [teamClub, setTeamClub] = useState('')
  const [scoutVisible, setScoutVisible] = useState(true)
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public')
  const [bio, setBio] = useState('')
  const [weeklySessions, setWeeklySessions] = useState(3)
  const [primarySport, setPrimarySport] = useState('')
  const [preferredMode, setPreferredMode] = useState<'training' | 'discovery'>('training')
  const [safeRecording, setSafeRecording] = useState(false)
  const [dataConsent, setDataConsent] = useState(false)

  const handleComplete = () => {
    onComplete({
      sports: selectedSports,
      displayName,
      username,
      location,
      teamClub,
      bio,
      skillLevel,
      privacy,
      scoutVisible,
      safeRecording,
      dataConsent,
      goals: {
        weeklySessions,
        primarySport: primarySport || selectedSports[0],
      },
      preferredMode,
    })
  }

  const canProgress = () => {
    switch (step) {
      case 0: return selectedSports.length > 0 // Sports & Skill Level
      case 1: return displayName.length > 0 && username.length > 0 && location.length > 0 // Profile
      case 2: return true // Privacy & Scout Settings
      case 3: return safeRecording && dataConsent // Consent
      case 4: return true // Mode
      case 5: return true // Ready
      default: return false
    }
  }

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev =>
      prev.includes(sportId)
        ? prev.filter(s => s !== sportId)
        : [...prev, sportId]
    )
  }

  const steps = [
    // Step 0: Sport Selection
    <motion.div
      key="sports"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col min-h-[500px] px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">What sports do you play?</h2>
        <p className="text-muted-foreground">Select all that apply - we'll track your progress in each</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {SPORTS.map((sport) => {
          const selected = selectedSports.includes(sport.id)
          return (
            <motion.button
              key={sport.id}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSport(sport.id)}
              className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                selected
                  ? `border-2 bg-gradient-to-r ${sport.borderColor} p-[2px]`
                  : 'border-2 border-border hover:border-muted'
              }`}
            >
              {selected && (
                <div className="absolute inset-[2px] bg-card rounded-2xl" />
              )}

              <div className="relative flex flex-col items-center gap-3">
                {selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-sport-blue rounded-full p-1"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                )}

                <div className={`text-5xl ${selected ? 'scale-110' : ''} transition-transform`}>
                  {sport.emoji}
                </div>
                <p className="font-semibold text-sm">{sport.name}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {selectedSports.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-muted-foreground mb-8"
        >
          {selectedSports.length} sport{selectedSports.length !== 1 ? 's' : ''} selected
        </motion.div>
      )}

      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-bold mb-4 text-center">What's your skill level?</h3>
        <div className="grid grid-cols-3 gap-3">
          {['starter', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => setSkillLevel(level)}
              className={`p-4 rounded-xl border-2 transition-all ${
                skillLevel === level
                  ? 'border-sport-blue bg-sport-blue/10'
                  : 'border-border hover:border-sport-blue/50'
              }`}
            >
              {skillLevel === level && (
                <Check className="h-4 w-4 text-sport-blue mx-auto mb-1" />
              )}
              <p className="font-semibold text-sm capitalize">{level}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>,

    // Step 1: Profile Setup
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col min-h-[500px] px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Create your profile</h2>
        <p className="text-muted-foreground">Let other athletes know who you are</p>
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Display Name <span className="text-red-500">*</span></label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jordan Smith"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username <span className="text-red-500">*</span></label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jordan_athlete"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location <span className="text-red-500">*</span></label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Austin, TX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Team or Club (optional)</label>
            <Input
              value={teamClub}
              onChange={(e) => setTeamClub(e.target.value)}
              placeholder="River City United"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio (optional)</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your athletic journey..."
            className="resize-none"
            rows={3}
          />
        </div>
      </div>
    </motion.div>,

    // Step 2: Privacy & Scout Settings
    <motion.div
      key="privacy"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col min-h-[500px] px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Privacy & Visibility</h2>
        <p className="text-muted-foreground">Control who can see your content and profile</p>
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Account Privacy</h3>
          <div className="grid gap-3">
            {[
              { id: 'public', label: 'Public', desc: 'Anyone can see your clips and profile' },
              { id: 'followers', label: 'Followers Only', desc: 'Only your followers can see your content' },
              { id: 'private', label: 'Private', desc: 'Only you can see your clips' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setPrivacy(option.id as 'public' | 'followers' | 'private')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  privacy === option.id
                    ? 'border-sport-blue bg-sport-blue/10'
                    : 'border-border hover:border-sport-blue/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 ${privacy === option.id ? 'bg-sport-blue' : 'bg-border'}`}>
                    {privacy === option.id && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Scout & Coach Visibility</h3>
          <button
            onClick={() => setScoutVisible(!scoutVisible)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              scoutVisible
                ? 'border-sport-green bg-sport-green/10'
                : 'border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-full p-1 ${scoutVisible ? 'bg-sport-green' : 'bg-border'}`}>
                {scoutVisible && <Check className="h-3 w-3 text-white" />}
              </div>
              <div>
                <p className="font-semibold">Make me visible to scouts and coaches</p>
                <p className="text-sm text-muted-foreground">
                  Allow verified scouts and coaches to discover your profile and clips
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </motion.div>,

    // Step 3: Consent & Safety
    <motion.div
      key="consent"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col min-h-[500px] px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Safety & Consent</h2>
        <p className="text-muted-foreground">Help us keep the community safe</p>
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div
          onClick={() => setSafeRecording(!safeRecording)}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            safeRecording
              ? 'border-sport-blue bg-sport-blue/10'
              : 'border-border hover:border-sport-blue/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`mt-1 rounded-md p-1 ${safeRecording ? 'bg-sport-blue' : 'bg-border'}`}>
              {safeRecording && <Check className="h-5 w-5 text-white" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Safe Recording Pledge <span className="text-red-500">*</span></h3>
              <p className="text-sm text-muted-foreground mb-2">
                I will not film minors or teammates without explicit permission, and I'll respect facility policies about recording.
              </p>
              <p className="text-xs text-muted-foreground">
                Breaking this trust can remove your access to posting clips.
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setDataConsent(!dataConsent)}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            dataConsent
              ? 'border-sport-blue bg-sport-blue/10'
              : 'border-border hover:border-sport-blue/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`mt-1 rounded-md p-1 ${dataConsent ? 'bg-sport-blue' : 'bg-border'}`}>
              {dataConsent && <Check className="h-5 w-5 text-white" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Terms & Data Consent <span className="text-red-500">*</span></h3>
              <p className="text-sm text-muted-foreground">
                I agree to the Terms of Service and Privacy Policy. I understand my training data will be used to improve the platform experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>,

    // Step 4: Mode Selection
    <motion.div
      key="mode"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col min-h-[500px] px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose your focus</h2>
        <p className="text-muted-foreground">You can switch between modes anytime</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPreferredMode('training')}
          className={`relative overflow-hidden rounded-2xl p-8 border-2 transition-all text-left ${
            preferredMode === 'training'
              ? 'border-sport-blue shadow-xl shadow-sport-blue/20'
              : 'border-border hover:border-sport-blue/50'
          }`}
        >
          {preferredMode === 'training' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 bg-sport-blue rounded-full p-2"
            >
              <Check className="h-5 w-5 text-white" />
            </motion.div>
          )}

          <div className="bg-gradient-to-br from-sport-blue to-sport-green w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold mb-2">Training Mode</h3>
          <p className="text-muted-foreground mb-4">
            Focus on your personal progress, goals, and challenges. Perfect for dedicated training.
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-sport-blue" />
              <span>Personal dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sport-blue" />
              <span>Track your stats</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-sport-blue" />
              <span>Complete challenges</span>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPreferredMode('discovery')}
          className={`relative overflow-hidden rounded-2xl p-8 border-2 transition-all text-left ${
            preferredMode === 'discovery'
              ? 'border-sport-green shadow-xl shadow-sport-green/20'
              : 'border-border hover:border-sport-green/50'
          }`}
        >
          {preferredMode === 'discovery' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 bg-sport-green rounded-full p-2"
            >
              <Check className="h-5 w-5 text-white" />
            </motion.div>
          )}

          <div className="bg-gradient-to-br from-sport-green to-sport-orange w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold mb-2">Discovery Mode</h3>
          <p className="text-muted-foreground mb-4">
            Explore the community, find inspiration, and connect with athletes globally.
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-sport-green" />
              <span>TikTok-style feed</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-sport-green" />
              <span>Community content</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sport-green" />
              <span>Get inspired</span>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>,

    // Step 5: Ready to Go
    <motion.div
      key="ready"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[500px] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-sport-green to-sport-blue rounded-full blur-2xl opacity-50 animate-pulse" />
          <div className="relative bg-gradient-to-br from-sport-green to-sport-blue p-8 rounded-full">
            <Trophy className="h-16 w-16 text-white" />
          </div>
        </div>
      </motion.div>

      <h2 className="text-4xl font-black mb-4">You're all set!</h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Time to start your journey. Upload your first clip or explore what others are doing!
      </p>

      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 max-w-md">
        <p className="text-sm text-muted-foreground mb-4">Quick tip:</p>
        <p className="text-sm">
          Check out today's <span className="font-bold text-sport-blue">#DailyChallenge</span> to earn points and climb the leaderboard. Train daily to build your streak!
        </p>
      </div>
    </motion.div>,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-sport-blue/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i <= step ? 'bg-sport-blue w-12' : 'bg-border w-8'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {step + 1} of 6
          </p>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {steps[step]}
          </AnimatePresence>

          {/* Navigation */}
          <div className="border-t border-border p-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="gap-2"
            >
              Back
            </Button>

            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProgress()}
                className="gap-2 bg-gradient-to-r from-sport-blue to-sport-green hover:opacity-90"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="gap-2 bg-gradient-to-r from-sport-green to-sport-blue hover:opacity-90"
              >
                Let's Go!
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
