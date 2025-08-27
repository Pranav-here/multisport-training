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
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"

const sports = [
  { id: "soccer", name: "Soccer", icon: Football, color: "sport-green" },
  { id: "basketball", name: "Basketball", icon: Trophy, color: "sport-orange" },
  { id: "volleyball", name: "Volleyball", icon: Target, color: "sport-blue" },
  { id: "cricket", name: "Cricket", icon: Target, color: "sport-green" },
  { id: "rugby", name: "Rugby", icon: Football, color: "sport-orange" },
  { id: "baseball", name: "Baseball", icon: Target, color: "sport-blue" },
  { id: "running", name: "Running", icon: Dumbbell, color: "sport-green" },
  { id: "tennis", name: "Tennis", icon: Target, color: "sport-orange" },
]

const skillLevels = [
  { id: "starter", name: "Starter", description: "Just getting started or returning to sport" },
  { id: "intermediate", name: "Intermediate", description: "Have some experience and looking to improve" },
  { id: "advanced", name: "Advanced", description: "Experienced athlete looking to optimize performance" },
]

const goals = [
  "Ball Control",
  "Vertical Jump",
  "Serve Accuracy",
  "Sprint Speed",
  "Endurance",
  "Agility",
  "Strength",
  "Flexibility",
  "Coordination",
  "Mental Focus",
]

const privacyOptions = [
  { id: "public", name: "Public", description: "Anyone can see your posts and progress" },
  { id: "friends", name: "Friends Only", description: "Only people you follow can see your content" },
  { id: "private", name: "Private", description: "Only you can see your posts and progress" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState("sports")
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [affiliation, setAffiliation] = useState("")
  const [skillLevel, setSkillLevel] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [privacy, setPrivacy] = useState("public")
  const [contentConsent, setContentConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { updateUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const steps = ["sports", "location", "goals", "privacy"]
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) => (prev.includes(sportId) ? prev.filter((id) => id !== sportId) : [...prev, sportId]))
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]))
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
        return privacy !== "" && contentConsent
      default:
        return false
    }
  }

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      // Update user with onboarding data
      updateUser({
        sports: selectedSports,
        location,
        affiliation,
        skillLevel,
        goals: selectedGoals,
        privacy: privacy as "public" | "friends" | "private",
      })

      toast({
        title: "Welcome to MultiSport!",
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-sport-blue to-sport-green flex items-center justify-center">
              <span className="text-white font-bold text-lg">MS</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Let's set up your profile</h1>
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
                        <Card
                          key={sport.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                          }`}
                          onClick={() => toggleSport(sport.id)}
                        >
                          <CardContent className="p-4 text-center">
                            <Icon className={`h-8 w-8 mx-auto mb-2 text-${sport.color}`} />
                            <p className="font-medium text-sm">{sport.name}</p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  {selectedSports.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4">
                      <span className="text-sm text-muted-foreground">Selected:</span>
                      {selectedSports.map((sportId) => {
                        const sport = sports.find((s) => s.id === sportId)
                        return (
                          <Badge key={sportId} variant="secondary">
                            {sport?.name}
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
                  <CardDescription>Tell us where you're based and what team or school you're part of.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">City or Region</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliation">School or Club</Label>
                    <Input
                      id="affiliation"
                      placeholder="e.g., Lincoln High School, City FC"
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                    />
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
                  <CardDescription>Help us understand your current level and what you want to improve.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>What's your overall skill level?</Label>
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

                  <div className="space-y-3">
                    <Label>What do you want to improve? (Select all that apply)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {goals.map((goal) => (
                        <div
                          key={goal}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                            selectedGoals.includes(goal) ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                          }`}
                          onClick={() => toggleGoal(goal)}
                        >
                          <span className="text-sm font-medium">{goal}</span>
                        </div>
                      ))}
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
                    <RadioGroup value={privacy} onValueChange={setPrivacy}>
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
                      onCheckedChange={(checked) => setContentConsent(checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="consent"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Content consent
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        I understand that any content I post may be used to help improve the platform and provide better
                        recommendations to other users.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep} disabled={currentStepIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === "privacy" ? (
              <Button onClick={handleFinish} disabled={!canProceed() || isLoading}>
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
