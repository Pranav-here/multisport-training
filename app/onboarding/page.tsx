"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import {
  PhoneCall as Football,
  Dumbbell,
  Trophy,
  Target,
  MapPin,
  Shield,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"

// Static classes for Tailwind (avoid dynamic class names)
const sports = [
  { id: "soccer", name: "Soccer", icon: Football, colorClass: "text-sport-green", emoji: "⚽" },
  { id: "basketball", name: "Basketball", icon: Trophy, colorClass: "text-sport-orange", emoji: "🏀" },
  { id: "volleyball", name: "Volleyball", icon: Target, colorClass: "text-sport-blue", emoji: "🏐" },
  { id: "cricket", name: "Cricket", icon: Target, colorClass: "text-sport-green", emoji: "🏏" },
  { id: "rugby", name: "Rugby", icon: Football, colorClass: "text-sport-orange", emoji: "🏉" },
  { id: "baseball", name: "Baseball", icon: Target, colorClass: "text-sport-blue", emoji: "⚾" },
  { id: "running", name: "Running", icon: Dumbbell, colorClass: "text-sport-green", emoji: "🏃" },
  { id: "tennis", name: "Tennis", icon: Target, colorClass: "text-sport-orange", emoji: "🎾" },
] as const

const skillLevels = [
  { id: "starter", name: "Starter", description: "Just getting started or returning to sport" },
  { id: "intermediate", name: "Intermediate", description: "Have some experience and looking to improve" },
  { id: "advanced", name: "Advanced", description: "Experienced athlete looking to optimize performance" },
] as const

// General goals used across sports
const generalGoals = [
  { id: "endurance", label: "Endurance", emoji: "⛽" },
  { id: "agility", label: "Agility", emoji: "🌀" },
  { id: "strength", label: "Strength", emoji: "💪" },
  { id: "flexibility", label: "Flexibility", emoji: "🤸" },
  { id: "coordination", label: "Coordination", emoji: "🧩" },
  { id: "mental_focus", label: "Mental Focus", emoji: "🧠" },
] as const

// Sport-specific goal library
const sportGoals: Record<string, { id: string; label: string; emoji: string }[]> = {
  soccer: [
    { id: "first_touch", label: "First Touch", emoji: "🦶" },
    { id: "ball_control", label: "Ball Control", emoji: "⚽" },
    { id: "passing_accuracy", label: "Passing Accuracy", emoji: "🎯" },
    { id: "finishing", label: "Finishing", emoji: "🥅" },
    { id: "sprint_speed_soc", label: "Sprint Speed", emoji: "⚡" },
  ],
  basketball: [
    { id: "shooting_form", label: "Shooting Form", emoji: "🎯" },
    { id: "three_pt", label: "3PT Accuracy", emoji: "3️⃣" },
    { id: "handles", label: "Ball Handling", emoji: "🖐️" },
    { id: "defensive_slides", label: "Defensive Slides", emoji: "🛡️" },
    { id: "vertical_jump_bk", label: "Vertical Jump", emoji: "🦘" },
  ],
  volleyball: [
    { id: "serve_accuracy", label: "Serve Accuracy", emoji: "🎯" },
    { id: "receive", label: "Serve Receive", emoji: "👐" },
    { id: "approach_timing", label: "Approach Timing", emoji: "⏱️" },
    { id: "block_timing", label: "Block Timing", emoji: "🧱" },
  ],
  cricket: [
    { id: "cover_drive", label: "Cover Drive", emoji: "🏏" },
    { id: "bowling_line_length", label: "Bowling Line & Length", emoji: "📏" },
    { id: "fielding", label: "Fielding", emoji: "🧤" },
    { id: "strike_rate", label: "Strike Rate", emoji: "📈" },
  ],
  rugby: [
    { id: "tackle_technique", label: "Tackle Technique", emoji: "🤼" },
    { id: "pass_accuracy_rgb", label: "Pass Accuracy", emoji: "🎯" },
    { id: "ruck_speed", label: "Ruck Speed", emoji: "⚡" },
    { id: "kicking", label: "Kicking", emoji: "🥅" },
  ],
  baseball: [
    { id: "bat_speed", label: "Bat Speed", emoji: "🦾" },
    { id: "pitch_control", label: "Pitch Control", emoji: "🎯" },
    { id: "fielding_range", label: "Fielding Range", emoji: "📐" },
    { id: "throwing_velocity", label: "Throwing Velocity", emoji: "🏹" },
  ],
  running: [
    { id: "fivek_time", label: "5K Time", emoji: "5️⃣" },
    { id: "cadence", label: "Stride Cadence", emoji: "🎵" },
    { id: "vo2max", label: "VO₂ Max", emoji: "🫁" },
    { id: "lactate_threshold", label: "Lactate Threshold", emoji: "🧪" },
  ],
  tennis: [
    { id: "serve_speed", label: "Serve Speed", emoji: "💥" },
    { id: "backhand", label: "Backhand Consistency", emoji: "↩️" },
    { id: "footwork", label: "Footwork", emoji: "👣" },
    { id: "return", label: "Return Placement", emoji: "🎯" },
  ],
}

const privacyOptions = [
  { id: "public", name: "Public", description: "Anyone can see your posts and progress" },
  { id: "friends", name: "Friends Only", description: "Only people you follow can see your content" },
  { id: "private", name: "Private", description: "Only you can see your posts and progress" },
] as const

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<"sports" | "location" | "goals" | "privacy">("sports")
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [affiliation, setAffiliation] = useState("")
  const [skillLevel, setSkillLevel] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [goalFilter, setGoalFilter] = useState<"all" | string>("all")
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">("public")
  const [contentConsent, setContentConsent] = useState(false)
  const [safetyPledge, setSafetyPledge] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { updateUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const steps = ["sports", "location", "goals", "privacy"] as const
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) => {
      const next = prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]
      // If filter was a sport that got removed, reset to "all"
      if (goalFilter !== "all" && !next.includes(goalFilter)) setGoalFilter("all")
      return next
    })
  }

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) => (prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]))
  }

  const canProceed = () => {
    switch (currentStep) {
      case "sports":
        return selectedSports.length > 0
      case "location":
        return location.trim() !== "" && affiliation.trim() !== ""
      case "goals":
        return skillLevel !== "" && selectedGoals.length > 0
      case "privacy":
        return privacy !== "" && contentConsent && safetyPledge
      default:
        return false
    }
  }

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as typeof currentStep)
    }
  }

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as typeof currentStep)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      updateUser({
        sports: selectedSports,
        location,
        affiliation,
        skillLevel,
        goals: selectedGoals,
        privacy,
      })

      toast({
        title: "Welcome to MultiSport 🎉",
        description: "Your profile has been set up successfully.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Build the goal list based on selection and filter
  const buildGoalList = () => {
    // Start with general goals
    let pool: { id: string; label: string; emoji: string }[] = [...generalGoals]

    // Add goals from selected sports
    selectedSports.forEach((s) => {
      const list = sportGoals[s] || []
      pool = pool.concat(list)
    })

    // Unique by id
    const uniqueMap = new Map<string, { id: string; label: string; emoji: string }>()
    for (const g of pool) uniqueMap.set(g.id, g)
    let final = Array.from(uniqueMap.values())

    // Filter by chip if needed
    if (goalFilter !== "all") {
      final = final.filter((g) => (sportGoals[goalFilter] || []).some((sg) => sg.id === g.id))
    }

    // Nice sort: sport-specific first when a sport is filtered, else keep general first
    if (goalFilter === "all") {
      final.sort((a, b) => {
        const aGeneral = generalGoals.some((gg) => gg.id === a.id)
        const bGeneral = generalGoals.some((gg) => gg.id === b.id)
        if (aGeneral !== bGeneral) return aGeneral ? -1 : 1
        return a.label.localeCompare(b.label)
      })
    } else {
      final.sort((a, b) => a.label.localeCompare(b.label))
    }

    return final
  }

  const goalsToShow = buildGoalList()

  // Helper texts for disabled states
  const helperText = () => {
    if (currentStep === "sports" && selectedSports.length === 0) return "Pick at least one sport to continue."
    if (currentStep === "location" && (!location || !affiliation)) return "Add your city and school or club."
    if (currentStep === "goals" && (selectedGoals.length === 0 || !skillLevel))
      return "Choose your skill level and at least one goal."
    if (currentStep === "privacy" && !(contentConsent && safetyPledge))
      return "Please agree to content use and the safety pledge."
    return ""
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-sport-blue to-sport-green flex items-center justify-center">
              <span className="text-white font-bold text-lg">MS</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Let’s set up your profile</h1>
            <p className="text-muted-foreground">Help us personalize your MultiSport experience</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Tabs value={currentStep} className="w-full">
            {/* Sports Selection */}
            <TabsContent value="sports">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Football className="h-5 w-5 text-sport-blue" />
                    Choose Your Sports
                  </CardTitle>
                  <CardDescription>
                    Select all the sports you play or want to train in. You can always add more later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sports.map((sport) => {
                      const Icon = sport.icon
                      const isSelected = selectedSports.includes(sport.id)
                      return (
                        <button
                          type="button"
                          key={sport.id}
                          onClick={() => toggleSport(sport.id)}
                          className={[
                            "rounded-xl border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            isSelected ? "ring-2 ring-primary bg-primary/5 shadow-sm" : "hover:shadow-md",
                          ].join(" ")}
                          aria-pressed={isSelected}
                        >
                          <Card className="border-0 shadow-none">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center ${sport.colorClass}`}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {sport.emoji} {sport.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">Tap to select</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </button>
                      )
                    })}
                  </div>

                  {selectedSports.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 items-center">
                      <span className="text-sm text-muted-foreground">Selected:</span>
                      {selectedSports.map((sportId) => {
                        const sport = sports.find((s) => s.id === sportId)!
                        return (
                          <Badge key={sportId} variant="secondary" className="px-2 py-1">
                            {sport.emoji} {sport.name}
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location & Affiliation */}
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-sport-green" />
                    Location & Affiliation
                  </CardTitle>
                  <CardDescription>Tell us where you train and who you play for.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">City or Region</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Chicago, IL"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">This helps us build local leaderboards.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliation">School or Club</Label>
                    <Input
                      id="affiliation"
                      placeholder="e.g., IIT Intramurals, City FC"
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">We use this for team sessions and friendly rivalries.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals & Skill Level */}
            <TabsContent value="goals">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-sport-orange" />
                    Skill Level & Goals
                  </CardTitle>
                  <CardDescription>Pick your level and what you want to improve.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>What’s your overall skill level?</Label>
                    <RadioGroup value={skillLevel} onValueChange={setSkillLevel}>
                      {skillLevels.map((level) => (
                        <div key={level.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={level.id} id={level.id} />
                          <div className="flex-1">
                            <Label htmlFor={level.id} className="font-medium">
                              {level.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Goal filter chips */}
                  <div className="space-y-2">
                    <Label>Filter goals by sport</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={goalFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGoalFilter("all")}
                      >
                        ⭐ All
                      </Button>
                      {selectedSports.map((sid) => {
                        const s = sports.find((sp) => sp.id === sid)!
                        return (
                          <Button
                            key={sid}
                            type="button"
                            variant={goalFilter === sid ? "default" : "outline"}
                            size="sm"
                            onClick={() => setGoalFilter(sid)}
                          >
                            {s.emoji} {s.name}
                          </Button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select a sport to see its specific goals, or show all.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>What do you want to improve? (pick a few)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {goalsToShow.map((g) => {
                        const selected = selectedGoals.includes(g.id)
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => toggleGoal(g.id)}
                            className={[
                              "p-3 rounded-lg border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                              selected ? "bg-primary/5 border-primary shadow-sm" : "hover:bg-muted/50 hover:shadow-sm",
                            ].join(" ")}
                            aria-pressed={selected}
                          >
                            <span className="text-sm font-medium">
                              {g.emoji} {g.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-sport-blue" />
                    Privacy & Content
                  </CardTitle>
                  <CardDescription>Choose how you want to share your progress and content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Who can see your posts and progress?</Label>
                    <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as typeof privacy)}>
                      {privacyOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <div className="flex-1">
                            <Label htmlFor={option.id} className="font-medium">
                              {option.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent"
                      checked={contentConsent}
                      onCheckedChange={(checked) => setContentConsent(!!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="consent" className="text-sm font-medium leading-none">
                        Content consent
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        I understand that content I post may be used to improve recommendations and the product.
                      </p>
                    </div>
                  </div>

                  {/* Safety pledge (do not film minors) */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="safety"
                      checked={safetyPledge}
                      onCheckedChange={(checked) => setSafetyPledge(!!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="safety" className="text-sm font-medium leading-none">
                        Safe recording pledge
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        I will get consent before filming anyone, I will not film minors without a parent or legal
                        guardian’s permission, and I will follow local rules where I record.
                      </p>
                    </div>
                  </div>

                  {/* Quick safety tips */}
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium text-foreground mb-1">
                      <Info className="h-4 w-4" /> Safety reminders
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Record in safe, well lit areas with room to move.</li>
                      <li>Do not share private info in clips or captions.</li>
                      <li>If someone asks not to be filmed, stop and delete the clip.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-8">
            <Button variant="outline" onClick={prevStep} disabled={currentStepIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {helperText() && <p className="text-xs text-muted-foreground">{helperText()}</p>}

            {currentStep === "privacy" ? (
              <Button onClick={handleFinish} disabled={!canProceed() || isLoading}>
                {isLoading ? "Setting up…" : "Complete Setup ✅"}
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={!canProceed()}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
