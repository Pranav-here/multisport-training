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

export interface HashtagInfo {
  tag: string
  description: string
}

const HASHTAGS_BY_DAY: Record<number, HashtagInfo[]> = {
  0: [
    { tag: "#StretchSunday", description: "Reset with gentle mobility work before the new week kicks off." },
    { tag: "#SelfCareSunday", description: "Recharge with recovery work and mindful downtime." },
    { tag: "#StatsSunday", description: "Review the week, celebrate wins, and set next-week goals." },
    { tag: "#SkillCheckSunday", description: "Spotlight the skills you want to sharpen next week." },
    { tag: "#SetUpSunday", description: "Map out workouts and meals so you are ready to perform." },
    { tag: "#SyncUpSunday", description: "Touch base with teammates and align on training plans." },
    { tag: "#SteadySunday", description: "Keep things light with an easy shakeout or mobility flow." },
  ],
  1: [
    { tag: "#MotivationMonday", description: "Kick off the week with a post about your big goal." },
    { tag: "#MoveItMonday", description: "Share the drill that gets you moving with purpose." },
    { tag: "#MindsetMonday", description: "Lock in your mental game and inspire teammates." },
    { tag: "#MobilityMonday", description: "Show the warm-up that keeps your body ready." },
    { tag: "#MomentumMonday", description: "Highlight the habit that keeps your momentum rolling." },
    { tag: "#MakeItHappenMonday", description: "Document the first rep of a week full of progress." },
    { tag: "#MuscleMonday", description: "Spotlight the strength work powering your season." },
  ],
  2: [
    { tag: "#TechniqueTuesday", description: "Break down the skill you are perfecting right now." },
    { tag: "#TrainingTuesday", description: "Walk us through your session plan from warm-up to cool-down." },
    { tag: "#TempoTuesday", description: "Share how you are dialing in pace and rhythm." },
    { tag: "#TeamworkTuesday", description: "Shout out a teammate or drill that builds chemistry." },
    { tag: "#TipTuesday", description: "Drop a smart cue or coaching point other athletes can use." },
    { tag: "#ToughnessTuesday", description: "Show how you are leveling up grit and resilience." },
    { tag: "#ThriveTuesday", description: "Celebrate the small wins that help you thrive midweek." },
  ],
  3: [
    { tag: "#WorkItWednesday", description: "Show the grind that keeps your game sharp." },
    { tag: "#WellnessWednesday", description: "Highlight nutrition or recovery choices fueling your body." },
    { tag: "#WorkshopWednesday", description: "Break down the cues you are drilling during practice." },
    { tag: "#WinningWednesday", description: "Share a recent breakthrough or lesson learned." },
    { tag: "#WorkoutWednesday", description: "Post your favorite midweek workout finisher." },
    { tag: "#WisdomWednesday", description: "Pass along advice that keeps you grounded." },
    { tag: "#WorkrateWednesday", description: "Spotlight the effort that separates you from the pack." },
  ],
  4: [
    { tag: "#ThriveThursday", description: "Showcase how you stay energized down the stretch." },
    { tag: "#TechniqueThursday", description: "Capture the fine details that make the skill work." },
    { tag: "#TacticalThursday", description: "Explain the game plan or play you are locking in." },
    { tag: "#ThrowdownThursday", description: "Share a competitive moment from training or scrimmage." },
    { tag: "#ThankfulThursday", description: "Give props to the people supporting your grind." },
    { tag: "#ThresholdThursday", description: "Show how you are pushing past comfort zones today." },
    { tag: "#TrailblazeThursday", description: "Highlight a new challenge you are taking on." },
  ],
  5: [
    { tag: "#FocusFriday", description: "Dial in the detail that will matter most on game day." },
    { tag: "#FinishStrongFriday", description: "Show the effort that locks down the end of your week." },
    { tag: "#FirstTouchFriday", description: "Share how you are elevating your control and quickness." },
    { tag: "#FlexFriday", description: "Celebrate gains and the grind behind them." },
    { tag: "#FilmFriday", description: "Break down a clip that taught you something new." },
    { tag: "#FuelUpFriday", description: "Post the meals or snacks powering your performance." },
    { tag: "#FastFeetFriday", description: "Spotlight footwork that keeps your game electric." },
  ],
  6: [
    { tag: "#SkillSaturday", description: "Join the community and share your progress with today's hashtag!" },
    { tag: "#SessionSaturday", description: "Let everyone see your favorite weekend session." },
    { tag: "#SweatSaturday", description: "Capture the extra work that separates your game." },
    { tag: "#ScrimmageSaturday", description: "Highlight game-speed reps with your crew." },
    { tag: "#StrengthSaturday", description: "Post the lift or circuit powering your weekend." },
    { tag: "#SetpieceSaturday", description: "Dial in the plays and set pieces you are mastering." },
    { tag: "#ShowtimeSaturday", description: "Share the highlight that made today's grind worth it." },
  ],
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function getTodaysHashtag(referenceDate: Date = new Date()): HashtagInfo {
  const dayOfWeek = referenceDate.getDay()
  const options = HASHTAGS_BY_DAY[dayOfWeek] ?? HASHTAGS_BY_DAY[6]
  const startOfYear = new Date(referenceDate.getFullYear(), 0, 1)
  const todayMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())
  const dayOfYear = Math.floor((todayMidnight.getTime() - startOfYear.getTime()) / MS_PER_DAY)
  if (!options || options.length === 0) {
    return HASHTAGS_BY_DAY[6][0]
  }
  const rotationIndex = ((dayOfYear % options.length) + options.length) % options.length
  return options[rotationIndex]
}


