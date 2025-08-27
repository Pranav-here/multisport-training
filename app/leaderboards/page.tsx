"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { AuthGuard } from "@/components/auth-guard"
import { LeaderboardEntryCard } from "@/components/leaderboard-entry"
import { Trophy, Users, Zap, Filter } from "lucide-react"
import { mockAthleteLeaderboard, mockTeamLeaderboard, filterOptions } from "@/lib/leaderboard-data"
import { useToast } from "@/hooks/use-toast"

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState("athletes")
  const [selectedSport, setSelectedSport] = useState("All Sports")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [selectedSchool, setSelectedSchool] = useState("All Schools")
  const [selectedTimeWindow, setSelectedTimeWindow] = useState("Weekly")
  const { toast } = useToast()

  const handleCreateRivalry = () => {
    toast({
      title: "Friendly Rivalry Created!",
      description: "Challenge sent to Roosevelt High School. They have 24 hours to accept.",
    })
  }

  const filteredAthletes = mockAthleteLeaderboard.filter((entry) => {
    if (selectedSport !== "All Sports" && entry.sport !== selectedSport) return false
    if (selectedLocation !== "All Locations" && entry.location !== selectedLocation) return false
    if (selectedSchool !== "All Schools" && entry.school !== selectedSchool) return false
    return true
  })

  const filteredTeams = mockTeamLeaderboard.filter((entry) => {
    if (selectedSport !== "All Sports" && entry.sport !== selectedSport) return false
    if (selectedLocation !== "All Locations" && entry.location !== selectedLocation) return false
    if (selectedSchool !== "All Schools" && entry.school !== selectedSchool) return false
    return true
  })

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Leaderboards</h1>
            <p className="text-muted-foreground">Compete with athletes and teams from your school, city, and beyond.</p>
          </div>

          {/* Friendly Rivalry Banner */}
          <Card className="mb-6 bg-gradient-to-r from-sport-blue/10 to-sport-green/10 border-sport-blue/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-sport-orange" />
                    <span>Friendly Rivalry</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Challenge another school or club to a friendly competition. Compare scores across multiple sports
                    and time periods.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Lincoln High vs Roosevelt High</Badge>
                    <Badge variant="outline">Soccer • Basketball • Volleyball</Badge>
                  </div>
                </div>
                <Button onClick={handleCreateRivalry} className="ml-4">
                  Create Challenge
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sport</label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.sports.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">School/Club</label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.schools.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={selectedTimeWindow} onValueChange={setSelectedTimeWindow}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.timeWindows.map((window) => (
                        <SelectItem key={window} value={window}>
                          {window}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="athletes" className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Athletes</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Teams</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="athletes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Athletes</CardTitle>
                  <CardDescription>
                    {selectedTimeWindow} rankings for {selectedSport.toLowerCase()} athletes
                    {selectedLocation !== "All Locations" && ` in ${selectedLocation}`}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="space-y-3">
                {filteredAthletes.map((entry) => (
                  <LeaderboardEntryCard key={entry.id} entry={entry} showSport={selectedSport === "All Sports"} />
                ))}
              </div>

              {filteredAthletes.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No athletes found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Teams</CardTitle>
                  <CardDescription>
                    {selectedTimeWindow} rankings for {selectedSport.toLowerCase()} teams
                    {selectedLocation !== "All Locations" && ` in ${selectedLocation}`}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="space-y-3">
                {filteredTeams.map((entry) => (
                  <Card key={entry.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            entry.rank === 1
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                              : entry.rank === 2
                                ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                                : entry.rank === 3
                                  ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.rank}
                        </div>

                        {/* Team Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{entry.teamName}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span className="truncate">{entry.school}</span>
                            <span>•</span>
                            <span>{entry.memberCount} members</span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-sport-blue">{entry.score.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">team points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTeams.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No teams found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
