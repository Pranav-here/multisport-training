'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import { mockBadges, mockLeaderboard, type Badge as BadgeType } from '@/lib/mock-data'
import {
  Calendar,
  MapPin,
  Users,
  Target,
  Settings,
  Activity,
  Award,
  TrendingUp,
  Flame,
  Trophy,
  Clock,
  BarChart3,
  Star,
  Zap,
  Share2,
  Edit,
  Camera,
  ChevronRight,
  Video,
  Image as ImageIcon,
} from 'lucide-react'

const PROFILE_EDIT_PATH = '/settings?tab=profile'

// Mock uploaded clips/posts
const mockUploads = [
  { id: '1', type: 'video', thumbnail: '/placeholder.svg', title: 'Amazing Goal', sport: 'Soccer', views: 1200, likes: 89, createdAt: '2 days ago' },
  { id: '2', type: 'video', thumbnail: '/placeholder.svg', title: 'Three-Pointer', sport: 'Basketball', views: 850, likes: 64, createdAt: '5 days ago' },
  { id: '3', type: 'video', thumbnail: '/placeholder.svg', title: 'Volleyball Spike', sport: 'Volleyball', views: 620, likes: 45, createdAt: '1 week ago' },
  { id: '4', type: 'video', thumbnail: '/placeholder.svg', title: 'Tennis Serve', sport: 'Tennis', views: 430, likes: 32, createdAt: '1 week ago' },
  { id: '5', type: 'video', thumbnail: '/placeholder.svg', title: 'Soccer Dribble', sport: 'Soccer', views: 980, likes: 71, createdAt: '2 weeks ago' },
  { id: '6', type: 'video', thumbnail: '/placeholder.svg', title: 'Basketball Dunk', sport: 'Basketball', views: 1500, likes: 112, createdAt: '2 weeks ago' },
]

// Mock data for demonstration
const statsData = {
  totalSessions: 127,
  totalHours: 89.5,
  currentStreak: 12,
  longestStreak: 28,
  activeDays: 94,
  totalXP: 14250,
}

const achievements = [
  { id: 1, title: 'First Steps', description: 'Complete your first training session', icon: '🎯', earned: true, date: '2 months ago' },
  { id: 2, title: 'Week Warrior', description: 'Train for 7 consecutive days', icon: '🔥', earned: true, date: '1 month ago' },
  { id: 3, title: 'Century Club', description: 'Complete 100 training sessions', icon: '💯', earned: true, date: '2 weeks ago' },
  { id: 4, title: 'Early Bird', description: 'Complete 10 morning sessions', icon: '🌅', earned: false },
  { id: 5, title: 'Jack of All Sports', description: 'Train in 5 different sports', icon: '⚡', earned: false },
  { id: 6, title: 'Marathon Month', description: 'Log 30+ sessions in one month', icon: '🏃', earned: false },
]

const recentActivity = [
  { id: 1, type: 'session', sport: 'Soccer', activity: 'Ball Control Drills', duration: '45 min', xp: 120, date: '2 hours ago' },
  { id: 2, type: 'achievement', title: 'Century Club unlocked', description: '100 sessions milestone', date: '2 days ago' },
  { id: 3, type: 'session', sport: 'Basketball', activity: 'Three-Point Practice', duration: '30 min', xp: 80, date: '3 days ago' },
  { id: 4, type: 'session', sport: 'Volleyball', activity: 'Serving Technique', duration: '40 min', xp: 100, date: '4 days ago' },
]

const sports = [
  { name: 'Soccer', level: 12, xp: 4200, progress: 65, color: 'from-green-500 to-emerald-600' },
  { name: 'Basketball', level: 9, xp: 3100, progress: 45, color: 'from-orange-500 to-red-600' },
  { name: 'Volleyball', level: 7, xp: 2400, progress: 30, color: 'from-blue-500 to-cyan-600' },
  { name: 'Tennis', level: 5, xp: 1550, progress: 78, color: 'from-yellow-500 to-amber-600' },
]

const personalRecords = [
  { title: 'Most Consecutive Days', value: '28 days', icon: Flame, color: 'text-orange-500' },
  { title: 'Single Session Duration', value: '2.5 hours', icon: Clock, color: 'text-blue-500' },
  { title: 'Weekly Sessions Record', value: '12 sessions', icon: BarChart3, color: 'text-green-500' },
  { title: 'Total XP Earned', value: '14,250 XP', icon: Zap, color: 'text-purple-500' },
]

const badgeRarityStyles: Record<BadgeType['rarity'], string> = {
  legendary: 'border-yellow-500 text-yellow-600',
  epic: 'border-purple-500 text-purple-600',
  rare: 'border-blue-500 text-blue-600',
  common: 'border-gray-500 text-gray-600',
}

export default function ProfilePage() {
  const { user, profile, session } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const displayName = user?.displayName ?? 'Athlete'
  const username = profile?.username ? `@${profile.username}` : null
  const avatarUrl = user?.avatarUrl ?? profile?.avatar_url ?? '/placeholder.svg'
  const email = user?.email ?? ''
  const bio = profile?.bio ?? 'No bio added yet. Share something about yourself!'
  const location = profile?.location ?? 'Location not set'
  const joinedDate = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  const levelProgress = useMemo(() => {
    const currentLevel = Math.floor(statsData.totalXP / 1000)
    const xpInCurrentLevel = statsData.totalXP % 1000
    return (xpInCurrentLevel / 1000) * 100
  }, [])

  const currentLevel = Math.floor(statsData.totalXP / 1000)

  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-background dark:bg-black">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-44 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-sport-blue/40 via-sport-green/20 to-transparent blur-3xl opacity-70 dark:opacity-20 dark:from-sport-blue/20 dark:via-sport-green/10" />
          <div className="absolute -bottom-36 -right-20 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-sport-orange/40 via-sport-blue/25 to-transparent blur-[120px] opacity-70 dark:opacity-20 dark:from-sport-orange/15 dark:via-sport-blue/10" />
        </div>

        <div className="container relative mx-auto px-4 py-6 pb-24 space-y-6 animate-fade-in">
          {/* Profile Header */}
          <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_25px_60px_rgba(15,23,42,0.35)] dark:border-white/12 dark:bg-white/[0.06] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-all duration-300 hover:shadow-[0_30px_70px_rgba(15,23,42,0.45)] dark:hover:shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sport-blue/20 via-transparent to-sport-green/20 opacity-70 dark:from-sport-blue/10 dark:to-sport-green/10 dark:opacity-50" />
            <CardContent className="relative z-10 p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 ring-4 ring-background ring-offset-2 ring-offset-background/60 transition-all duration-300 group-hover:ring-sport-blue/50">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-sport-blue to-sport-green text-white">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-2 rounded-full bg-sport-blue text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110">
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {username && (
                          <Badge variant="secondary" className="rounded-full bg-sport-blue/10 text-sport-blue border-sport-blue/20">
                            {username}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="rounded-full bg-purple-500/10 text-purple-500 border-purple-500/20">
                          Level {currentLevel}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {location}
                        </span>
                      )}
                      {joinedDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          Joined {joinedDate}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground max-w-2xl">{bio}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={PROFILE_EDIT_PATH}>
                    <Button className="w-full sm:w-auto rounded-full transition-all duration-300 hover:scale-105">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full sm:w-auto rounded-full transition-all duration-300 hover:scale-105">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>

              {/* Level Progress */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level {currentLevel} Progress</span>
                  <span className="font-semibold text-sport-blue">{statsData.totalXP % 1000} / 1000 XP</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Sessions', value: statsData.totalSessions, icon: Activity, color: 'from-blue-500 to-cyan-600' },
              { label: 'Hours', value: statsData.totalHours.toFixed(1), icon: Clock, color: 'from-purple-500 to-pink-600' },
              { label: 'Streak', value: `${statsData.currentStreak} days`, icon: Flame, color: 'from-orange-500 to-red-600' },
              { label: 'Total XP', value: statsData.totalXP.toLocaleString(), icon: Zap, color: 'from-yellow-500 to-amber-600' },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <Card
                  key={stat.label}
                  className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl shadow-lg dark:border-white/12 dark:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer animate-fade-in-up"
                >
                  <span className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 dark:opacity-5`} />
                  <CardContent className="relative z-10 p-4 text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 backdrop-blur-xl dark:bg-white/[0.06] border border-white/10 dark:border-white/12">
              <TabsTrigger value="overview" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="sports" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <Trophy className="h-4 w-4 mr-2" />
                Sports
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <Award className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <Activity className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="competition" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <Trophy className="h-4 w-4 mr-2" />
                Competition
              </TabsTrigger>
              <TabsTrigger value="uploads" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <Video className="h-4 w-4 mr-2" />
                Uploads
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Records */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Personal Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {personalRecords.map((record) => {
                      const Icon = record.icon
                      return (
                        <div key={record.title} className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/[0.06] border border-white/10 dark:border-white/12 transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/[0.05]">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${record.color}/10`}>
                              <Icon className={`h-5 w-5 ${record.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{record.title}</p>
                              <p className="text-xs text-muted-foreground">All-time best</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-foreground">{record.value}</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Training Goals */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-sport-green" />
                      Training Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Weekly Sessions</span>
                          <span className="text-sm text-muted-foreground">8 / 10</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Monthly Hours</span>
                          <span className="text-sm text-muted-foreground">32 / 40</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Soccer Mastery</span>
                          <span className="text-sm text-muted-foreground">Level 12</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>
                    <Separator />
                    <Link href={PROFILE_EDIT_PATH}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Target className="h-4 w-4 mr-2" />
                        Set New Goals
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sports Tab */}
            <TabsContent value="sports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sports.map((sport) => (
                  <Card
                    key={sport.name}
                    className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                  >
                    <span className={`absolute inset-0 bg-gradient-to-br ${sport.color} opacity-10 dark:opacity-5`} />
                    <CardContent className="relative z-10 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{sport.name}</h3>
                          <p className="text-sm text-muted-foreground">Level {sport.level}</p>
                        </div>
                        <Badge className="rounded-full bg-white/10 text-foreground border-white/20">
                          {sport.xp} XP
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress to Level {sport.level + 1}</span>
                          <span className="font-semibold text-sport-blue">{sport.progress}%</span>
                        </div>
                        <Progress value={sport.progress} className="h-2" />
                      </div>
                      <Button variant="ghost" size="sm" className="w-full mt-4">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06]">
                <CardHeader>
                  <CardTitle>Achievement Collection</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Unlocked {achievements.filter((a) => a.earned).length} of {achievements.length}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                          achievement.earned
                            ? 'bg-gradient-to-br from-sport-blue/10 to-sport-green/10 border-sport-blue/30 dark:from-sport-blue/5 dark:to-sport-green/5'
                            : 'bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12 opacity-60'
                        }`}
                      >
                        {achievement.earned && (
                          <div className="absolute top-2 right-2">
                            <div className="p-1 rounded-full bg-green-500/20">
                              <Award className="h-3 w-3 text-green-500" />
                            </div>
                          </div>
                        )}
                        <div className="text-4xl mb-3">{achievement.icon}</div>
                        <h4 className="font-semibold text-foreground mb-1">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-sport-blue font-medium">Earned {achievement.date}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06]">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-white/5 dark:bg-white/[0.06] border border-white/10 dark:border-white/12 transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/[0.05]"
                      >
                        <div className={`p-3 rounded-lg ${activity.type === 'session' ? 'bg-sport-blue/10' : 'bg-sport-green/10'}`}>
                          {activity.type === 'session' ? (
                            <Activity className="h-5 w-5 text-sport-blue" />
                          ) : (
                            <Trophy className="h-5 w-5 text-sport-green" />
                          )}
                        </div>
                        <div className="flex-1">
                          {activity.type === 'session' ? (
                            <>
                              <p className="font-semibold text-foreground">{activity.activity}</p>
                              <p className="text-sm text-muted-foreground">{activity.sport} • {activity.duration}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-500">
                                  +{activity.xp} XP
                                </Badge>
                                <span className="text-xs text-muted-foreground">{activity.date}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-foreground">{activity.title}</p>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                              <span className="text-xs text-muted-foreground mt-1 block">{activity.date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Load More Activity
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competition Tab */}
            <TabsContent value="competition" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leaderboard */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-sport-orange" />
                      School Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockLeaderboard.slice(0, 10).map((entry) => {
                      const isCurrentUser = entry.userId === user?.id
                      return (
                        <div
                          key={`${entry.userId}-${entry.rank}`}
                          className={`flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 hover:shadow-lg cursor-pointer dark:border-white/12 dark:bg-white/[0.06] dark:hover:border-white/20 ${isCurrentUser ? 'border-sport-blue/40 bg-sport-blue/10 dark:border-sport-blue/30 dark:bg-sport-blue/5' : ''}`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                              entry.rank === 1
                                ? 'bg-gradient-to-br from-amber-400 to-amber-500'
                                : entry.rank === 2
                                  ? 'bg-gradient-to-br from-zinc-300 to-zinc-500'
                                  : entry.rank === 3
                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {entry.rank}
                          </div>
                          <Avatar className="h-9 w-9 ring-2 ring-background">
                            <AvatarImage src={entry.userAvatar || '/placeholder.svg'} alt={entry.userName} />
                            <AvatarFallback className="text-xs">
                              {entry.userName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{entry.userName}</p>
                            <p className="truncate text-xs text-muted-foreground">{entry.school || 'Not set'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-sport-blue">{entry.score}</p>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground/80">pts</p>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Badges */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-sport-blue" />
                      Earned Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer dark:border-white/12 dark:bg-white/[0.06] dark:hover:border-white/20"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg text-sport-blue">{badge.icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">{badge.earnedDate}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`rounded-full border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold capitalize ${badgeRarityStyles[badge.rarity]}`}
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Uploads Tab */}
            <TabsContent value="uploads" className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-sport-blue" />
                      All Uploads
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">{mockUploads.length} clips</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mockUploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-white/10 bg-white/5 transition-all duration-300 hover:border-sport-blue/50 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                      >
                        {/* Thumbnail */}
                        <div className="absolute inset-0 bg-gradient-to-br from-sport-blue/20 to-sport-orange/20">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="h-12 w-12 text-white/50" />
                          </div>
                        </div>

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <p className="text-white font-semibold text-sm mb-1">{upload.title}</p>
                          <p className="text-white/70 text-xs mb-2">{upload.sport}</p>
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span>{upload.views} views</span>
                            <span>{upload.likes} likes</span>
                          </div>
                        </div>

                        {/* Duration badge */}
                        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {upload.type === 'video' ? '0:45' : 'IMG'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty state if no uploads */}
                  {mockUploads.length === 0 && (
                    <div className="text-center py-12">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">No uploads yet</p>
                      <p className="text-sm text-muted-foreground/70">
                        Share your highlights with the community
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
