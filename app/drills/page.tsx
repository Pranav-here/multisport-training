"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { AuthGuard } from "@/components/auth-guard"
import { DrillCard } from "@/components/drill-card"
import { ProgressCharts } from "@/components/progress-charts"
import { mockDrills, mockProgressData } from "@/lib/drill-data"
import { Dumbbell, TrendingUp } from "lucide-react"

const sports = [
  { id: "soccer", name: "Soccer", icon: "⚽" },
  { id: "basketball", name: "Basketball", icon: "🏀" },
  { id: "volleyball", name: "Volleyball", icon: "🏐" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
  { id: "strength", name: "Strength Training", icon: "💪" },
]

export default function DrillsPage() {
  const [activeTab, setActiveTab] = useState("drills")

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Drills & Progress</h1>
            <p className="text-muted-foreground">
              Master your skills with targeted drills and track your improvement over time.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="drills" className="flex items-center space-x-2">
                <Dumbbell className="h-4 w-4" />
                <span>Drill Library</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Progress</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drills" className="space-y-6">
              <Tabs defaultValue="soccer" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  {sports.map((sport) => (
                    <TabsTrigger key={sport.id} value={sport.id} className="flex items-center space-x-1">
                      <span className="text-lg">{sport.icon}</span>
                      <span className="hidden sm:inline">{sport.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {sports.map((sport) => (
                  <TabsContent key={sport.id} value={sport.id} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span className="text-2xl">{sport.icon}</span>
                          <span>{sport.name} Drills</span>
                        </CardTitle>
                        <CardDescription>
                          Improve your {sport.name.toLowerCase()} skills with these targeted training drills.
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockDrills[sport.id]?.map((drill) => <DrillCard key={drill.id} drill={drill} />) || (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                          <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>More {sport.name.toLowerCase()} drills coming soon!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <ProgressCharts progressData={mockProgressData} />
            </TabsContent>
          </Tabs>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
