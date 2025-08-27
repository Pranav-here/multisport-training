export interface Post {
  id: string
  userId: string
  userName: string
  userAvatar: string
  sport: string
  caption: string
  tags: string[]
  location: string
  date: string
  duration: string
  thumbnail: string
  videoUrl: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isSaved: boolean
  drillId?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  sport: string
  difficulty: "easy" | "medium" | "hard"
  points: number
  timeLeft: string
  participants: number
  thumbnail: string
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  weeklyGoal: number
  weeklyProgress: number
  todayCompleted: boolean
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userAvatar: string
  score: number
  school: string
  sport: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedDate: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface TeamSession {
  id: string
  title: string
  sport: string
  date: string
  time: string
  location: string
  participants: number
  maxParticipants: number
}

export const mockPosts: Post[] = [
  {
    id: "1",
    userId: "user1",
    userName: "Alex Chen",
    userAvatar: "/asian-athlete.png",
    sport: "Soccer",
    caption: "Working on my first touch control! Finally getting consistent with both feet 🔥 #FirstTouchFriday",
    tags: ["FirstTouchFriday", "BallControl", "Soccer"],
    location: "Lincoln High School",
    date: "2 hours ago",
    duration: "0:45",
    thumbnail: "/soccer-player-practicing-ball-control.png",
    videoUrl: "/sample-soccer-drill.mp4",
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    isSaved: false,
    drillId: "drill-1",
  },
  {
    id: "2",
    userId: "user2",
    userName: "Maria Rodriguez",
    userAvatar: "/latina-coach.png",
    sport: "Basketball",
    caption: "Vertical jump training paying off! New personal record today 💪",
    tags: ["VerticalJump", "Basketball", "PersonalRecord"],
    location: "City Gym",
    date: "4 hours ago",
    duration: "1:12",
    thumbnail: "/basketball-player-jumping-for-dunk.png",
    videoUrl: "/sample-basketball-drill.mp4",
    likes: 31,
    comments: 12,
    shares: 5,
    isLiked: true,
    isSaved: true,
    drillId: "drill-2",
  },
  {
    id: "3",
    userId: "user3",
    userName: "James Thompson",
    userAvatar: "/black-athlete.png",
    sport: "Volleyball",
    caption: "Serve accuracy drill - hitting the corners consistently now! Coach says I'm ready for varsity 🏐",
    tags: ["ServeAccuracy", "Volleyball", "VarsityReady"],
    location: "Roosevelt High",
    date: "6 hours ago",
    duration: "0:38",
    thumbnail: "/volleyball-player-serving-ball.png",
    videoUrl: "/sample-volleyball-drill.mp4",
    likes: 18,
    comments: 6,
    shares: 2,
    isLiked: false,
    isSaved: false,
    drillId: "drill-3",
  },
  {
    id: "4",
    userId: "user4",
    userName: "Emma Wilson",
    userAvatar: "/diverse-user-avatars.png",
    sport: "Tennis",
    caption: "Backhand slice technique finally clicking! Thanks to everyone who gave tips last week 🎾",
    tags: ["BackhandSlice", "Tennis", "TechniqueImprovement"],
    location: "Central Tennis Club",
    date: "1 day ago",
    duration: "0:52",
    thumbnail: "/tennis-player-hitting-backhand-slice.png",
    videoUrl: "/sample-tennis-drill.mp4",
    likes: 27,
    comments: 9,
    shares: 4,
    isLiked: true,
    isSaved: false,
    drillId: "drill-4",
  },
]

export const mockChallenge: Challenge = {
  id: "daily-1",
  title: "First Touch Friday",
  description: "Practice your first touch control with both feet. Complete 20 successful touches in a row!",
  sport: "Soccer",
  difficulty: "medium",
  points: 50,
  timeLeft: "18h 32m",
  participants: 1247,
  thumbnail: "/soccer-ball-control-challenge.png",
}

export const mockStreakData: StreakData = {
  currentStreak: 7,
  longestStreak: 12,
  weeklyGoal: 5,
  weeklyProgress: 4,
  todayCompleted: false,
}

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "leader1",
    userName: "Sarah Kim",
    userAvatar: "/diverse-user-avatars.png",
    score: 2840,
    school: "Lincoln High",
    sport: "Multi-Sport",
  },
  {
    rank: 2,
    userId: "leader2",
    userName: "Marcus Johnson",
    userAvatar: "/diverse-user-avatars.png",
    score: 2735,
    school: "Roosevelt High",
    sport: "Multi-Sport",
  },
  {
    rank: 3,
    userId: "leader3",
    userName: "Zoe Chen",
    userAvatar: "/diverse-user-avatars.png",
    score: 2690,
    school: "Lincoln High",
    sport: "Multi-Sport",
  },
]

export const mockBadges: Badge[] = [
  {
    id: "badge1",
    name: "First Touch Master",
    description: "Completed 100 first touch drills",
    icon: "⚽",
    earnedDate: "2 days ago",
    rarity: "rare",
  },
  {
    id: "badge2",
    name: "Week Warrior",
    description: "Maintained a 7-day training streak",
    icon: "🔥",
    earnedDate: "Today",
    rarity: "common",
  },
]

export const mockTeamSessions: TeamSession[] = [
  {
    id: "session1",
    title: "Soccer Skills Session",
    sport: "Soccer",
    date: "Tomorrow",
    time: "4:00 PM",
    location: "Field A",
    participants: 12,
    maxParticipants: 16,
  },
  {
    id: "session2",
    title: "Basketball Scrimmage",
    sport: "Basketball",
    date: "Sunday",
    time: "2:00 PM",
    location: "Gym 1",
    participants: 8,
    maxParticipants: 10,
  },
]

export const hashtagsOfTheDay = [
  "#FirstTouchFriday",
  "#MotivationMonday",
  "#TechniqueThursday",
  "#SkillSaturday",
  "#WisdomWednesday",
  "#TalentTuesday",
  "#StrengthSunday",
]

export function getTodaysHashtag(): string {
  const dayIndex = new Date().getDay()
  return hashtagsOfTheDay[dayIndex]
}
