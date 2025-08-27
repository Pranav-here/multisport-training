"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { AuthGuard } from "@/components/auth-guard"
import { TeamSessionCard } from "@/components/team-session-card"
import { Plus, Users, Calendar, Shield, Download } from "lucide-react"
import { mockTeamSessions, type TeamSession } from "@/lib/leaderboard-data"
import { useToast } from "@/hooks/use-toast"

export default function TeamsPage() {
  const [sessions, setSessions] = useState<TeamSession[]>(mockTeamSessions)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [safetyModalOpen, setSafetyModalOpen] = useState(false)
  const [newSession, setNewSession] = useState({
    title: "",
    sport: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: "16",
    drills: "",
  })
  const { toast } = useToast()

  const handleCreateSession = () => {
    if (!newSession.title || !newSession.sport || !newSession.date || !newSession.time || !newSession.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const session: TeamSession = {
      id: `session-${Date.now()}`,
      title: newSession.title,
      sport: newSession.sport,
      date: newSession.date,
      time: newSession.time,
      location: newSession.location,
      drills: newSession.drills
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
      createdBy: "current-user",
      createdByName: "You",
      participants: [],
      maxParticipants: Number.parseInt(newSession.maxParticipants),
      groupCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      status: "upcoming",
    }

    setSessions((prev) => [session, ...prev])
    setCreateModalOpen(false)
    setNewSession({
      title: "",
      sport: "",
      date: "",
      time: "",
      location: "",
      maxParticipants: "16",
      drills: "",
    })

    toast({
      title: "Session created!",
      description: `Group code: ${session.groupCode}. Share this with your athletes.`,
    })
  }

  const handleJoinSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              participants: [
                ...session.participants,
                {
                  id: "current-user",
                  name: "You",
                  avatar: "/diverse-user-avatars.png",
                  status: "joined" as const,
                  attempts: 0,
                  score: 0,
                },
              ],
            }
          : session,
      ),
    )

    toast({
      title: "Joined session!",
      description: "You'll receive a notification when the session starts.",
    })
  }

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your session data will be downloaded as a CSV file.",
    })
  }

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming")
  const activeSessions = sessions.filter((s) => s.status === "active")
  const completedSessions = sessions.filter((s) => s.status === "completed")

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Teams & Sessions</h1>
              <p className="text-muted-foreground">Create and manage group training sessions with your team.</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setSafetyModalOpen(true)} className="bg-transparent">
                <Shield className="h-4 w-4 mr-2" />
                Safety Guide
              </Button>
              <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Training Session</DialogTitle>
                    <DialogDescription>Set up a new group training session for your team.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Session Title *</Label>
                      <Input
                        id="title"
                        placeholder="Soccer Skills Training"
                        value={newSession.title}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sport">Sport *</Label>
                      <Select
                        value={newSession.sport}
                        onValueChange={(value) => setNewSession((prev) => ({ ...prev, sport: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Soccer">Soccer</SelectItem>
                          <SelectItem value="Basketball">Basketball</SelectItem>
                          <SelectItem value="Volleyball">Volleyball</SelectItem>
                          <SelectItem value="Tennis">Tennis</SelectItem>
                          <SelectItem value="Cricket">Cricket</SelectItem>
                          <SelectItem value="Rugby">Rugby</SelectItem>
                          <SelectItem value="Baseball">Baseball</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newSession.date}
                          onChange={(e) => setNewSession((prev) => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newSession.time}
                          onChange={(e) => setNewSession((prev) => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="Field A - Lincoln High School"
                        value={newSession.location}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        min="1"
                        max="50"
                        value={newSession.maxParticipants}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, maxParticipants: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drills">Drills (comma-separated)</Label>
                      <Textarea
                        id="drills"
                        placeholder="First Touch Control, Cone Weaving, Shooting Practice"
                        value={newSession.drills}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, drills: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleCreateSession} className="w-full">
                      Create Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Coach Ambassador Toolkit */}
          <Card className="mb-6 bg-gradient-to-r from-sport-green/10 to-sport-blue/10 border-sport-green/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-sport-green" />
                <span>Coach Ambassador Toolkit</span>
              </CardTitle>
              <CardDescription>
                Tools to help you create engaging group training sessions and track team progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-background">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-sport-blue" />
                  <h4 className="font-semibold mb-1">Session Planning</h4>
                  <p className="text-sm text-muted-foreground">
                    Create structured training sessions with specific drills and goals.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background">
                  <Users className="h-8 w-8 mx-auto mb-2 text-sport-green" />
                  <h4 className="font-semibold mb-1">Group Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Use group codes and QR codes to easily add athletes to sessions.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background">
                  <Download className="h-8 w-8 mx-auto mb-2 text-sport-orange" />
                  <h4 className="font-semibold mb-1">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Export session data and track individual athlete progress over time.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={handleExportData} className="bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export Session Data (CSV)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Tabs */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeSessions.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingSessions.map((session) => (
                    <TeamSessionCard key={session.id} session={session} onJoin={handleJoinSession} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                    <p className="text-muted-foreground mb-4">Create a new training session to get started.</p>
                    <Button onClick={() => setCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Session
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {activeSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeSessions.map((session) => (
                    <TeamSessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No active sessions</h3>
                    <p className="text-muted-foreground">Active sessions will appear here when they start.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedSessions.map((session) => (
                    <TeamSessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No completed sessions</h3>
                    <p className="text-muted-foreground">Completed sessions will appear here after they finish.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Safety Modal */}
          <Dialog open={safetyModalOpen} onOpenChange={setSafetyModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-sport-green" />
                  <span>Safe Recording Guidelines</span>
                </DialogTitle>
                <DialogDescription>
                  Important guidelines for safe and respectful group training sessions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Privacy & Consent</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Always get permission before recording anyone</li>
                    <li>• Respect those who don't want to be filmed</li>
                    <li>• Only share content with explicit consent</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Safe Recording Angles</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Focus on technique and form, not individuals</li>
                    <li>• Avoid close-ups of faces without permission</li>
                    <li>• Keep recordings appropriate and sports-focused</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Group Session Safety</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Ensure adequate space between participants</li>
                    <li>• Have first aid available during sessions</li>
                    <li>• Stop immediately if anyone gets injured</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
