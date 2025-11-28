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
  sportSlug: string
  difficulty: "easy" | "medium" | "hard"
  points: number
  participants: number
  thumbnail: string
  instructions: string[]
  challengeDate: string
  timeZone: string
  generatedAt: string
  deadline: string
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
    videoUrl: "/soccer-player-practicing-ball-control.mp4",
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    isSaved: false,
    drillId: "soccer-1",
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
    videoUrl: "/basketball-player-jumping-for-dunk.mp4",
    likes: 31,
    comments: 12,
    shares: 5,
    isLiked: true,
    isSaved: true,
    drillId: "basketball-1",
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
    videoUrl: "/volleyball-player-serving-ball.mp4",
    likes: 18,
    comments: 6,
    shares: 2,
    isLiked: false,
    isSaved: false,
    drillId: "volleyball-1",
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
    videoUrl: "/tennis-player-hitting-backhand-slice.mp4",
    likes: 27,
    comments: 9,
    shares: 4,
    isLiked: true,
    isSaved: false,
    drillId: "tennis-1",
  },
  // {
  //   id: "5",
  //   userId: "coach-james",
  //   userName: "James Frampton",
  //   userAvatar: "/diverse-user-avatars.png",
  //   sport: "Strength Training",
  //   caption:
  //     "Coach James breaks down the lateral raise: shoulders pinned down, lead with your elbows, and extend farther as you build control.",
  //   tags: ["TryThisDrill", "LateralRaise", "ShoulderStrength", "StrengthTraining"],
  //   location: "Alpha Sigs Gym",
  //   date: "Today",
  //   duration: "0:30",
  //   thumbnail: "/sports-training-video.png",
  //   videoUrl: "/james-tiktok.mp4",
  //   likes: 14,
  //   comments: 5,
  //   shares: 3,
  //   isLiked: false,
  //   isSaved: false,
  //   drillId: "strength-shoulder-raise",
  // },
]

export const mockChallenge: Challenge = {
  id: "daily-1",
  title: "First Touch Friday",
  description: "Practice your first touch control with both feet. Complete 20 successful touches in a row!",
  sport: "Soccer",
  sportSlug: "soccer",
  difficulty: "medium",
  points: 50,
  participants: 1247,
  thumbnail: "/soccer-ball-control-challenge.png",
  instructions: [
    "Juggle with alternating feet for 2 minutes to activate your touch.",
    "Receive and cushion 20 passes with your weaker foot, keeping the ball within one step.",
    "Finish with 10 one-touch wall passes, focusing on quick reset steps.",
  ],
  challengeDate: "2025-10-09",
  timeZone: "America/Chicago",
  generatedAt: "2025-10-09T12:00:00.000Z",
  deadline: "2025-10-10T05:00:00.000Z",
}

export const mockStreakData: StreakData = {
  currentStreak: 7,
  longestStreak: 12,
  weeklyGoal: 7,
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
    name: "Streak Warrior",
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

export interface TrainingBuddy {
  id: string
  name: string
  avatar: string
  sport: string
  location: string
  distance?: string
  nextSession?: {
    time: string
    date: string
  }
  availability: 'now' | 'today' | 'this-week'
  matchScore?: number
  commonSports?: string[]
}

export interface UpcomingEvent {
  id: string
  title: string
  type: 'tournament' | 'camp' | 'clinic' | 'scrimmage'
  sport: string
  date: string
  time: string
  location: string
  spotsLeft?: number
  price?: string
}

export const mockTrainingBuddies: TrainingBuddy[] = [
  {
    id: "buddy1",
    name: "Jordan Martinez",
    avatar: "/diverse-user-avatars.png",
    sport: "Soccer",
    location: "Lincoln High School",
    distance: "0.8 mi",
    availability: "now",
    matchScore: 92,
    commonSports: ["Soccer", "Basketball"],
    nextSession: {
      date: "Today",
      time: "4:00 PM"
    }
  },
  {
    id: "buddy2",
    name: "Taylor Swift",
    avatar: "/diverse-user-avatars.png",
    sport: "Basketball",
    location: "City Gym",
    distance: "1.2 mi",
    availability: "today",
    matchScore: 85,
    commonSports: ["Basketball", "Volleyball"],
    nextSession: {
      date: "Today",
      time: "6:30 PM"
    }
  },
  {
    id: "buddy3",
    name: "Sam Chen",
    avatar: "/asian-athlete.png",
    sport: "Tennis",
    location: "Central Tennis Club",
    distance: "2.1 mi",
    availability: "this-week",
    matchScore: 78,
    commonSports: ["Tennis"],
    nextSession: {
      date: "Wednesday",
      time: "5:00 PM"
    }
  },
]

export const mockUpcomingEvents: UpcomingEvent[] = [
  {
    id: "event1",
    title: "Youth Soccer Tournament",
    type: "tournament",
    sport: "Soccer",
    date: "Dec 15, 2025",
    time: "9:00 AM",
    location: "Lincoln High School",
    spotsLeft: 4,
    price: "$25"
  },
  {
    id: "event2",
    title: "Basketball Skills Camp",
    type: "camp",
    sport: "Basketball",
    date: "Dec 20-22, 2025",
    time: "10:00 AM - 3:00 PM",
    location: "City Sports Complex",
    spotsLeft: 12,
    price: "$120"
  },
  {
    id: "event3",
    title: "Free Tennis Clinic",
    type: "clinic",
    sport: "Tennis",
    date: "Dec 18, 2025",
    time: "2:00 PM",
    location: "Central Tennis Club",
    spotsLeft: 8,
    price: "Free"
  },
]

export interface TrendingHashtagPost {
  id: string
  thumbnail: string
  userName: string
  userAvatar: string
  likes: number
}

export const mockTrendingHashtagPosts: TrendingHashtagPost[] = [
  {
    id: "trending1",
    thumbnail: "/soccer-player-practicing-ball-control.png",
    userName: "Alex Chen",
    userAvatar: "/asian-athlete.png",
    likes: 142
  },
  {
    id: "trending2",
    thumbnail: "/basketball-player-jumping-for-dunk.png",
    userName: "Maria Rodriguez",
    userAvatar: "/latina-coach.png",
    likes: 98
  },
  {
    id: "trending3",
    thumbnail: "/volleyball-player-serving-ball.png",
    userName: "James Thompson",
    userAvatar: "/black-athlete.png",
    likes: 76
  },
]



