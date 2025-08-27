import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Calendar, Settings, Trophy, Target, Award, Activity } from "lucide-react"
import { mockUserProfile } from "@/lib/analytics-data"
import Link from "next/link"

export default function ProfilePage() {
  const profile = mockUserProfile

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback>
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={profile.bio}
              readOnly
              className="min-h-20 resize-none border-none p-0 focus-visible:ring-0"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sports Practiced */}
          <Card>
            <CardHeader>
              <CardTitle>Sports Practiced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.sports.map((sport, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-semibold">{sport.name}</h4>
                      <p className="text-sm text-muted-foreground">{sport.yearsPlaying} years</p>
                    </div>
                    <Badge
                      variant={
                        sport.level === "Advanced"
                          ? "default"
                          : sport.level === "Intermediate"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {sport.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievement Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {profile.achievements.map((achievement) => {
                  const IconComponent =
                    achievement.icon === "Target"
                      ? Target
                      : achievement.icon === "Calendar"
                        ? Calendar
                        : achievement.icon === "Trophy"
                          ? Trophy
                          : Award

                  return (
                    <div key={achievement.id} className="flex flex-col items-center p-3 rounded-lg border text-center">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-2">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(achievement.earnedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.recentActivity.map((activity) => {
                const IconComponent =
                  activity.type === "drill" ? Target : activity.type === "session" ? Activity : Trophy

                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "drill"
                          ? "bg-green-100 text-green-600"
                          : activity.type === "session"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      {activity.sport && (
                        <Badge variant="outline" className="mt-1">
                          {activity.sport}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
