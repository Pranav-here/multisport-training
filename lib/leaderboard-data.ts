export interface LeaderboardEntry {
  id: string
  rank: number
  userId: string
  userName: string
  userAvatar: string
  score: number
  school: string
  location: string
  sport: string
  country: string
  change: number // +/- from last period
  isCurrentUser?: boolean
}

export interface TeamLeaderboardEntry {
  id: string
  rank: number
  teamId: string
  teamName: string
  teamAvatar: string
  score: number
  school: string
  location: string
  sport: string
  memberCount: number
  change: number
}

export interface TeamSession {
  id: string
  title: string
  sport: string
  date: string
  time: string
  location: string
  drills: string[]
  createdBy: string
  createdByName: string
  participants: SessionParticipant[]
  maxParticipants: number
  groupCode: string
  status: "upcoming" | "active" | "completed"
  stats?: SessionStats
}

export interface SessionParticipant {
  id: string
  name: string
  avatar: string
  status: "joined" | "completed" | "in-progress"
  attempts: number
  score: number
}

export interface SessionStats {
  totalAttempts: number
  averageScore: number
  completionRate: number
  topPerformer: string
}

export const mockAthleteLeaderboard: LeaderboardEntry[] = [
  {
    id: "1",
    rank: 1,
    userId: "user1",
    userName: "Sarah Kim",
    userAvatar: "/diverse-user-avatars.png",
    score: 2840,
    school: "Lincoln High School",
    location: "San Francisco, CA",
    sport: "Multi-Sport",
    country: "US",
    change: 2,
  },
  {
    id: "2",
    rank: 2,
    userId: "user2",
    userName: "Marcus Johnson",
    userAvatar: "/black-athlete.png",
    score: 2735,
    school: "Roosevelt High School",
    location: "San Francisco, CA",
    sport: "Multi-Sport",
    country: "US",
    change: -1,
  },
  {
    id: "3",
    rank: 3,
    userId: "user3",
    userName: "Zoe Chen",
    userAvatar: "/asian-athlete.png",
    score: 2690,
    school: "Lincoln High School",
    location: "San Francisco, CA",
    sport: "Multi-Sport",
    country: "US",
    change: 1,
    isCurrentUser: true,
  },
  {
    id: "4",
    rank: 4,
    userId: "user4",
    userName: "Emma Rodriguez",
    userAvatar: "/latina-coach.png",
    score: 2580,
    school: "Central High School",
    location: "San Francisco, CA",
    sport: "Multi-Sport",
    country: "US",
    change: 0,
  },
  {
    id: "5",
    rank: 5,
    userId: "user5",
    userName: "James Wilson",
    userAvatar: "/diverse-user-avatars.png",
    score: 2465,
    school: "Roosevelt High School",
    location: "San Francisco, CA",
    sport: "Multi-Sport",
    country: "US",
    change: 3,
  },
]

export const mockTeamLeaderboard: TeamLeaderboardEntry[] = [
  {
    id: "1",
    rank: 1,
    teamId: "team1",
    teamName: "Lincoln Lions",
    teamAvatar: "/team-lincoln-lions.png",
    score: 12450,
    school: "Lincoln High School",
    location: "San Francisco, CA",
    sport: "Multi-Sport",
    memberCount: 24,
    change: 1,
  },
  {
    id: "2",
    rank: 2,
    teamId: "team2",
    teamName: "Roosevelt Eagles",
    teamAvatar: "/team-roosevelt-eagles.png",
    score: 11890,
    school: "Roosevelt High School",
    location: "San Francisco, CA",
    sport: "Multi-Sport",
    memberCount: 22,
    change: -1,
  },
  {
    id: "3",
    rank: 3,
    teamId: "team3",
    teamName: "Central Wildcats",
    teamAvatar: "/team-central-wildcats.png",
    score: 11340,
    school: "Central High School",
    location: "San Francisco, CA",
    sport: "Multi-Sport",
    memberCount: 18,
    change: 0,
  },
]

export const mockTeamSessions: TeamSession[] = [
  {
    id: "session1",
    title: "Soccer Skills Training",
    sport: "Soccer",
    date: "2024-01-08",
    time: "4:00 PM",
    location: "Field A - Lincoln High",
    drills: ["First Touch Control", "Cone Weaving", "Shooting Practice"],
    createdBy: "coach1",
    createdByName: "Coach Martinez",
    participants: [
      { id: "p1", name: "Alex Chen", avatar: "/asian-athlete.png", status: "joined", attempts: 0, score: 0 },
      { id: "p2", name: "Maria Santos", avatar: "/latina-coach.png", status: "joined", attempts: 0, score: 0 },
      { id: "p3", name: "Jordan Kim", avatar: "/diverse-user-avatars.png", status: "joined", attempts: 0, score: 0 },
    ],
    maxParticipants: 16,
    groupCode: "SOCCER24",
    status: "upcoming",
  },
  {
    id: "session2",
    title: "Basketball Fundamentals",
    sport: "Basketball",
    date: "2024-01-09",
    time: "3:30 PM",
    location: "Gym 1 - Roosevelt High",
    drills: ["Free Throw Shooting", "Vertical Jump Training", "Dribbling"],
    createdBy: "coach2",
    createdByName: "Coach Thompson",
    participants: [
      { id: "p4", name: "Marcus Johnson", avatar: "/black-athlete.png", status: "completed", attempts: 15, score: 85 },
      {
        id: "p5",
        name: "Sarah Kim",
        avatar: "/diverse-user-avatars.png",
        status: "completed",
        attempts: 12,
        score: 92,
      },
      {
        id: "p6",
        name: "Tyler Brown",
        avatar: "/diverse-user-avatars.png",
        status: "in-progress",
        attempts: 8,
        score: 78,
      },
    ],
    maxParticipants: 12,
    groupCode: "BBALL09",
    status: "active",
    stats: {
      totalAttempts: 35,
      averageScore: 85,
      completionRate: 67,
      topPerformer: "Sarah Kim",
    },
  },
  {
    id: "session3",
    title: "Volleyball Serve Practice",
    sport: "Volleyball",
    date: "2024-01-07",
    time: "5:00 PM",
    location: "Gym 2 - Central High",
    drills: ["Serve Accuracy Challenge", "Passing Drills"],
    createdBy: "coach3",
    createdByName: "Coach Davis",
    participants: [
      { id: "p7", name: "Emma Rodriguez", avatar: "/latina-coach.png", status: "completed", attempts: 20, score: 88 },
      { id: "p8", name: "Zoe Chen", avatar: "/asian-athlete.png", status: "completed", attempts: 18, score: 91 },
      {
        id: "p9",
        name: "James Wilson",
        avatar: "/diverse-user-avatars.png",
        status: "completed",
        attempts: 22,
        score: 79,
      },
    ],
    maxParticipants: 14,
    groupCode: "VBALL07",
    status: "completed",
    stats: {
      totalAttempts: 60,
      averageScore: 86,
      completionRate: 100,
      topPerformer: "Zoe Chen",
    },
  },
]

export const filterOptions = {
  sports: ["All Sports", "Soccer", "Basketball", "Volleyball", "Tennis", "Cricket", "Rugby", "Baseball", "Running"],
  locations: ["All Locations", "San Francisco, CA", "Los Angeles, CA", "New York, NY", "Chicago, IL", "Houston, TX"],
  schools: [
    "All Schools",
    "Lincoln High School",
    "Roosevelt High School",
    "Central High School",
    "Washington High School",
    "Jefferson High School",
  ],
  timeWindows: ["Daily", "Weekly", "Monthly", "All Time"],
}
