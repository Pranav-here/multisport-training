"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { AuthGuard } from "@/components/auth-guard"
import { mockDrills } from "@/lib/drill-data"
import { Play, Clock, Target, AlertTriangle, Lightbulb, Video, ArrowLeft, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function DrillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [attemptData, setAttemptData] = useState({
    reps: "",
    sets: "",
    distance: "",
    accuracy: "",
    notes: "",
  })

  // Find the drill from all sports
  const drill = Object.values(mockDrills)
    .flat()
    .find((d) => d.id === params.id)

  if (!drill) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Drill not found</h1>
              <Link href="/drills">
                <Button>Back to Drills</Button>
              </Link>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleRecordAttempt = () => {
    setIsRecording(true)
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setIsRecording(false)
          toast({
            title: "Recording started!",
            description: "Start your drill attempt now. Tap stop when finished.",
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleLogAttempt = () => {
    // Validate required fields
    if (!attemptData.notes.trim()) {
      toast({
        title: "Please add notes",
        description: "Notes help track your progress over time.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would save to a database
    toast({
      title: "Attempt logged!",
      description: "Your progress has been recorded successfully.",
    })

    setLogModalOpen(false)
    setAttemptData({
      reps: "",
      sets: "",
      distance: "",
      accuracy: "",
      notes: "",
    })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Drills
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{drill.sport}</Badge>
                        <Badge className={getDifficultyColor(drill.difficulty)} variant="secondary">
                          {drill.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl mb-2">{drill.title}</CardTitle>
                      <CardDescription className="text-base">{drill.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{drill.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{drill.targetSkills.length} skills</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Demo Video */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5" />
                    <span>Demo Video</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={drill.thumbnail || "/placeholder.svg"}
                      alt={drill.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/sports-drill-demo.png"
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="lg" className="h-16 w-16 rounded-full">
                        <Play className="h-8 w-8 ml-1" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1" onClick={handleRecordAttempt} disabled={isRecording}>
                      {isRecording ? `Recording in ${countdown}...` : "Record Attempt"}
                    </Button>
                    <Dialog open={logModalOpen} onOpenChange={setLogModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Plus className="h-4 w-4 mr-2" />
                          Log Attempt
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Log Your Attempt</DialogTitle>
                          <DialogDescription>
                            Record the details of your training session to track progress.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="reps">Reps</Label>
                              <Input
                                id="reps"
                                type="number"
                                placeholder="20"
                                value={attemptData.reps}
                                onChange={(e) => setAttemptData((prev) => ({ ...prev, reps: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sets">Sets</Label>
                              <Input
                                id="sets"
                                type="number"
                                placeholder="3"
                                value={attemptData.sets}
                                onChange={(e) => setAttemptData((prev) => ({ ...prev, sets: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="distance">Distance (optional)</Label>
                              <Input
                                id="distance"
                                placeholder="10 yards"
                                value={attemptData.distance}
                                onChange={(e) => setAttemptData((prev) => ({ ...prev, distance: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="accuracy">Accuracy % (optional)</Label>
                              <Input
                                id="accuracy"
                                type="number"
                                placeholder="85"
                                value={attemptData.accuracy}
                                onChange={(e) => setAttemptData((prev) => ({ ...prev, accuracy: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="How did it feel? What did you learn?"
                              value={attemptData.notes}
                              onChange={(e) => setAttemptData((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                          </div>
                          <Button onClick={handleLogAttempt} className="w-full">
                            Log Attempt
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Perform</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {drill.steps.map((step, index) => (
                      <li key={index} className="flex space-x-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
                          {index + 1}
                        </div>
                        <p className="text-sm text-balance">{step}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Equipment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Equipment Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {drill.equipment.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Target Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Target Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {drill.targetSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Coaching Cues */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-sport-orange" />
                    <span>Coaching Cues</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {drill.coachingCues.map((cue, index) => (
                      <li key={index} className="flex space-x-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-sport-orange mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-balance">{cue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Safety Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {drill.safetyTips.map((tip, index) => (
                      <li key={index} className="flex space-x-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-balance">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
