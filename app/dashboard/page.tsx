"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Hash } from "lucide-react"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { AuthGuard } from "@/components/auth-guard"
import { VideoCard } from "@/components/video-card"
import { DailyChallengeCard } from "@/components/daily-challenge-card"
import { StreakWidget } from "@/components/streak-widget"
import { SidebarWidgets } from "@/components/sidebar-widgets"
import {
  mockPosts,
  mockChallenge,
  mockStreakData,
  mockLeaderboard,
  mockBadges,
  mockTeamSessions,
  getTodaysHashtag,
  type Post,
} from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const { toast } = useToast()

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleSave = (postId: string) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, isSaved: !post.isSaved } : post)))
    toast({
      title: "Post saved",
      description: "You can find saved posts in your profile.",
    })
  }

  const handleShare = (postId: string) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)))
    toast({
      title: "Post shared",
      description: "Link copied to clipboard!",
    })
  }

  const handleFlag = (postId: string) => {
    toast({
      title: "Content reported",
      description: "Thank you for helping keep our community safe.",
    })
  }

  const handleJoinChallenge = () => {
    toast({
      title: "Challenge joined!",
      description: "Good luck with today's first touch challenge!",
    })
  }

  const handleQuickPost = () => {
    toast({
      title: "Coming soon",
      description: "Quick post feature will be available soon!",
    })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Top Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DailyChallengeCard challenge={mockChallenge} onJoin={handleJoinChallenge} />
                <div className="space-y-4">
                  <StreakWidget streakData={mockStreakData} />
                  <Button className="w-full" onClick={handleQuickPost}>
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Post
                  </Button>
                </div>
              </div>

              {/* Hashtag of the Day */}
              <Card className="bg-gradient-to-r from-sport-blue/10 to-sport-green/10 border-sport-blue/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Hash className="h-5 w-5 text-sport-blue" />
                    <span className="text-lg font-semibold">Hashtag of the Day:</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1 bg-sport-blue/20 text-sport-blue">
                      {getTodaysHashtag()}
                    </Badge>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Join the community and share your progress with today's hashtag!
                  </p>
                </CardContent>
              </Card>

              {/* Feed */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Your Feed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <VideoCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onSave={handleSave}
                      onShare={handleShare}
                      onFlag={handleFlag}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block">
              <SidebarWidgets leaderboard={mockLeaderboard} badges={mockBadges} teamSessions={mockTeamSessions} />
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </AuthGuard>
  )
}
