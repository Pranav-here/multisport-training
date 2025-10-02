'use client'

import Link from 'next/link'

import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { Calendar, MapPin, Users, Target, Settings, Plus, Activity, Award } from 'lucide-react'

const PROFILE_EDIT_PATH = '/settings?tab=profile'

const profilePrompts = [
  { label: 'Location', icon: MapPin },
  { label: 'Team or school', icon: Users },
  { label: 'Primary sport', icon: Target },
]

export default function ProfilePage() {
  const { user, profile, session } = useAuth()

  const displayName = user?.displayName ?? 'Athlete'
  const username = profile?.username ? `@${profile.username}` : null
  const avatarUrl = user?.avatarUrl ?? profile?.avatar_url ?? '/placeholder.svg'
  const email = user?.email ?? ''
  const joinedDate = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString()
    : null

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6">
        <Card>
          <CardContent className="p-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  {username ? (
                    <Badge variant="secondary" className="mt-1">
                      {username}
                    </Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {email ? (
                    <span>{email}</span>
                  ) : null}
                  {joinedDate ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {joinedDate}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <Link href={PROFILE_EDIT_PATH}>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Edit profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share a short bio to introduce yourself to the community.
            </p>
            <Link href={PROFILE_EDIT_PATH}>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add bio
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profilePrompts.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">Not set yet</p>
                    </div>
                  </div>
                  <Link href={PROFILE_EDIT_PATH}>
                    <Button variant="ghost" size="sm">Add</Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Goals and achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Achievements</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">No achievements added yet.</p>
                <Link href={PROFILE_EDIT_PATH}>
                  <Button variant="ghost" size="sm">Track progress</Button>
                </Link>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Training goals</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Set goals to stay motivated.</p>
                <Link href={PROFILE_EDIT_PATH}>
                  <Button variant="ghost" size="sm">Add goal</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">You have not logged any activity yet.</p>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Explore drills and sessions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}

