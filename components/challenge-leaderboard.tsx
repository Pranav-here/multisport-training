'use client'

import { useState, useMemo } from 'react'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userAvatar: string
  score: number
  points: number
  school?: string
  isCurrentUser?: boolean
}

// Mock data generator
function generateMockLeaderboard(count: number = 50): LeaderboardEntry[] {
  const names = [
    'Alex Johnson', 'Maya Patel', 'Jordan Lee', 'Sam Rodriguez', 'Taylor Chen',
    'Casey Williams', 'Morgan Davis', 'Riley Martinez', 'Avery Thompson', 'Quinn Garcia',
    'Blake Anderson', 'Drew Wilson', 'Kai Moore', 'Sage Taylor', 'River Jackson'
  ]

  const schools = [
    'Lincoln High', 'Washington Prep', 'Roosevelt Academy', 'Kennedy School',
    'Jefferson High', 'Madison College Prep', 'Wilson Athletics'
  ]

  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    userId: `user-${i + 1}`,
    userName: names[Math.floor(Math.random() * names.length)],
    userAvatar: `/placeholder.svg`,
    score: Math.max(50, 100 - i * 2 + Math.floor(Math.random() * 10)),
    points: Math.floor((100 - i) * 1.5 + Math.random() * 20),
    school: i % 3 === 0 ? schools[Math.floor(Math.random() * schools.length)] : undefined,
    isCurrentUser: i === 7, // Mock current user at rank 8
  }))
}

interface ChallengeLeaderboardProps {
  challengeId?: string
  className?: string
}

export function ChallengeLeaderboard({ challengeId, className }: ChallengeLeaderboardProps) {
  const [filter, setFilter] = useState<'global' | 'school' | 'friends'>('global')

  const mockData = useMemo(() => generateMockLeaderboard(50), [])

  const filteredData = useMemo(() => {
    if (filter === 'school') {
      return mockData.filter(entry => entry.school === 'Lincoln High').slice(0, 20)
    }
    if (filter === 'friends') {
      return mockData.slice(0, 10) // Mock friends list
    }
    return mockData
  }, [filter, mockData])

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />
    return null
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
    if (rank === 2) return 'from-gray-400/20 to-gray-500/10 border-gray-400/30'
    if (rank === 3) return 'from-orange-500/20 to-orange-600/10 border-orange-500/30'
    return 'from-white/5 to-transparent border-white/10'
  }

  return (
    <Card className={cn('overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sport-blue" />
          Challenge Leaderboard
        </CardTitle>
        <CardDescription>
          Top performers for this challenge
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="school">My School</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3 mt-4">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No entries yet for this filter</p>
                <p className="text-sm mt-1">Be the first to submit!</p>
              </div>
            ) : (
              <>
                {/* Top 3 Podium */}
                {filteredData.slice(0, 3).length === 3 && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center order-first sm:order-none">
                      <div className="relative">
                        <Avatar className="w-16 h-16 ring-4 ring-gray-400/30">
                          <AvatarImage src={filteredData[1].userAvatar} alt={filteredData[1].userName} />
                          <AvatarFallback className="bg-gray-400/20">
                            {filteredData[1].userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white">
                          2
                        </div>
                      </div>
                      <p className="text-xs font-semibold mt-2 text-center">{filteredData[1].userName.split(' ')[0]}</p>
                      <p className="text-xs text-muted-foreground">{filteredData[1].score} pts</p>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center -mt-4">
                      <div className="relative">
                        <Avatar className="w-20 h-20 ring-4 ring-yellow-500/40">
                          <AvatarImage src={filteredData[0].userAvatar} alt={filteredData[0].userName} />
                          <AvatarFallback className="bg-yellow-500/20">
                            {filteredData[0].userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                          <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-sm font-bold text-white">
                          1
                        </div>
                      </div>
                      <p className="text-sm font-bold mt-2 text-center">{filteredData[0].userName.split(' ')[0]}</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">{filteredData[0].score} pts</p>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center order-last sm:order-none">
                      <div className="relative">
                        <Avatar className="w-16 h-16 ring-4 ring-orange-600/30">
                          <AvatarImage src={filteredData[2].userAvatar} alt={filteredData[2].userName} />
                          <AvatarFallback className="bg-orange-600/20">
                            {filteredData[2].userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold text-white">
                          3
                        </div>
                      </div>
                      <p className="text-xs font-semibold mt-2 text-center">{filteredData[2].userName.split(' ')[0]}</p>
                      <p className="text-xs text-muted-foreground">{filteredData[2].score} pts</p>
                    </div>
                  </div>
                )}

                {/* Rest of leaderboard */}
                <div className="space-y-2">
                  {filteredData.slice(3, 20).map((entry) => (
                    <div
                      key={entry.userId}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-r transition-all',
                        entry.isCurrentUser
                          ? 'border-sport-blue/50 from-sport-blue/10 to-sport-blue/5 ring-2 ring-sport-blue/20'
                          : getRankColor(entry.rank),
                        'hover:scale-[1.02] cursor-pointer'
                      )}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 shrink-0">
                        {getRankBadge(entry.rank) || (
                          <span className="text-sm font-bold text-muted-foreground">
                            #{entry.rank}
                          </span>
                        )}
                      </div>

                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.userAvatar} alt={entry.userName} />
                        <AvatarFallback>
                          {entry.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {entry.userName}
                          {entry.isCurrentUser && (
                            <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                          )}
                        </p>
                        {entry.school && (
                          <p className="text-xs text-muted-foreground truncate">{entry.school}</p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-sport-blue">{entry.score}</p>
                        <p className="text-xs text-muted-foreground">+{entry.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredData.length > 20 && (
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Showing top 20 of {filteredData.length} entries
                  </p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
