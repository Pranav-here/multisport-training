import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, BarChart3, MessageSquare, Plus, Trophy, MapPin } from "lucide-react"

export default function CoachPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Coach Ambassador Toolkit</h1>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Coach Level
          </Badge>
        </div>

        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="athletes">Athletes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-6">
            {/* Create New Session */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Training Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Session Title</label>
                    <Input placeholder="e.g., Soccer Fundamentals Practice" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sport</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soccer">Soccer</SelectItem>
                        <SelectItem value="basketball">Basketball</SelectItem>
                        <SelectItem value="volleyball">Volleyball</SelectItem>
                        <SelectItem value="tennis">Tennis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date & Time</label>
                    <Input type="datetime-local" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input placeholder="e.g., Lincoln High School Gym" />
                </div>
                <div>
                  <label className="text-sm font-medium">Session Description</label>
                  <Textarea placeholder="Describe the focus and goals of this session..." />
                </div>
                <Button className="w-full">Create Session & Generate QR Code</Button>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Soccer Fundamentals",
                      sport: "Soccer",
                      date: "Today, 3:00 PM",
                      location: "Field A",
                      participants: 12,
                      status: "Active",
                    },
                    {
                      title: "Basketball Drills",
                      sport: "Basketball",
                      date: "Tomorrow, 4:30 PM",
                      location: "Main Gym",
                      participants: 8,
                      status: "Scheduled",
                    },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{session.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{session.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{session.participants} athletes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={session.status === "Active" ? "default" : "secondary"}>{session.status}</Badge>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="athletes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Athlete Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", sport: "Soccer", level: "Advanced", sessions: 24 },
                    { name: "Mike Chen", sport: "Basketball", level: "Intermediate", sessions: 18 },
                    { name: "Emma Davis", sport: "Volleyball", level: "Beginner", sessions: 12 },
                    { name: "Alex Rodriguez", sport: "Tennis", level: "Intermediate", sessions: 15 },
                  ].map((athlete, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-blue-600">
                            {athlete.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{athlete.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{athlete.sport}</span>
                            <Badge variant="outline" className="text-xs">
                              {athlete.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{athlete.sessions}</p>
                        <p className="text-sm text-muted-foreground">sessions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Athletes</p>
                      <p className="text-2xl font-bold">47</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sessions This Month</p>
                      <p className="text-2xl font-bold">23</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Improvement</p>
                      <p className="text-2xl font-bold">+15%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Performance analytics charts would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">Send Announcement</span>
                </div>
                <Textarea placeholder="Type your message to all athletes..." />
                <Button>Send to All Athletes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { from: "Sarah J.", message: "Great session today! When is the next one?", time: "2 hours ago" },
                    { from: "Mike C.", message: "Can we work on free throws next time?", time: "1 day ago" },
                    { from: "Emma D.", message: "Thanks for the feedback on my serve!", time: "2 days ago" },
                  ].map((msg, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{msg.from}</p>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
