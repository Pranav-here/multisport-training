export interface AnalyticsData {
  totalSessions: number
  averageScore: number
  streakDays: number
  sportsPracticed: number
  performanceOverTime: Array<{
    date: string
    score: number
    sessions: number
  }>
  sessionsBySport: Array<{
    sport: string
    sessions: number
    color: string
  }>
  skillAssessment: Array<{
    skill: string
    current: number
    previous: number
  }>
  activityHeatmap: Array<{
    date: string
    count: number
  }>
  achievements: Array<{
    id: string
    title: string
    description: string
    date: string
    type: "badge" | "milestone"
    icon: string
  }>
}

export const mockAnalyticsData: AnalyticsData = {
  totalSessions: 127,
  averageScore: 8.4,
  streakDays: 12,
  sportsPracticed: 4,
  performanceOverTime: [
    { date: "2024-01-01", score: 7.2, sessions: 3 },
    { date: "2024-01-08", score: 7.8, sessions: 5 },
    { date: "2024-01-15", score: 8.1, sessions: 4 },
    { date: "2024-01-22", score: 8.3, sessions: 6 },
    { date: "2024-01-29", score: 8.7, sessions: 5 },
    { date: "2024-02-05", score: 8.9, sessions: 7 },
    { date: "2024-02-12", score: 8.4, sessions: 4 },
    { date: "2024-02-19", score: 8.8, sessions: 6 },
  ],
  sessionsBySport: [
    { sport: "Soccer", sessions: 45, color: "#22c55e" },
    { sport: "Basketball", sessions: 38, color: "#3b82f6" },
    { sport: "Volleyball", sessions: 28, color: "#f97316" },
    { sport: "Tennis", sessions: 16, color: "#8b5cf6" },
  ],
  skillAssessment: [
    { skill: "Speed", current: 8.5, previous: 7.8 },
    { skill: "Agility", current: 7.9, previous: 7.2 },
    { skill: "Accuracy", current: 8.2, previous: 8.0 },
    { skill: "Power", current: 7.6, previous: 7.1 },
    { skill: "Endurance", current: 8.8, previous: 8.3 },
    { skill: "Technique", current: 8.1, previous: 7.5 },
  ],
  activityHeatmap: Array.from({ length: 365 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 5),
    }
  }),
  achievements: [
    {
      id: "1",
      title: "First Goal!",
      description: "Completed your first training session",
      date: "2024-01-15",
      type: "badge",
      icon: "Target",
    },
    {
      id: "2",
      title: "Week Warrior",
      description: "Trained for 7 consecutive days",
      date: "2024-01-22",
      type: "milestone",
      icon: "Calendar",
    },
    {
      id: "3",
      title: "Multi-Sport Master",
      description: "Practiced 3 different sports",
      date: "2024-02-01",
      type: "badge",
      icon: "Trophy",
    },
    {
      id: "4",
      title: "Century Club",
      description: "Completed 100 training sessions",
      date: "2024-02-15",
      type: "milestone",
      icon: "Award",
    },
  ],
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  location: string
  joinedDate: string
  bio: string
  sports: Array<{
    name: string
    level: "Beginner" | "Intermediate" | "Advanced"
    yearsPlaying: number
  }>
  recentActivity: Array<{
    id: string
    type: "drill" | "session" | "achievement"
    title: string
    description: string
    date: string
    sport?: string
  }>
  achievements: Array<{
    id: string
    title: string
    icon: string
    earnedDate: string
  }>
}

export const mockUserProfile: UserProfile = {
  id: "user-1",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  avatar: "/diverse-user-avatars.png",
  location: "San Francisco, CA",
  joinedDate: "2024-01-01",
  bio: "Multi-sport athlete passionate about continuous improvement. Love sharing training tips and connecting with fellow athletes!",
  sports: [
    { name: "Soccer", level: "Advanced", yearsPlaying: 8 },
    { name: "Basketball", level: "Intermediate", yearsPlaying: 5 },
    { name: "Volleyball", level: "Intermediate", yearsPlaying: 3 },
    { name: "Tennis", level: "Beginner", yearsPlaying: 1 },
  ],
  recentActivity: [
    {
      id: "1",
      type: "drill",
      title: "Completed First Touch Control",
      description: "Improved accuracy by 15%",
      date: "2024-02-20",
      sport: "Soccer",
    },
    {
      id: "2",
      type: "achievement",
      title: "Earned Century Club badge",
      description: "Completed 100 training sessions",
      date: "2024-02-15",
    },
    {
      id: "3",
      type: "session",
      title: "Team Practice Session",
      description: "Lincoln Lions - 2 hours",
      date: "2024-02-18",
      sport: "Basketball",
    },
    {
      id: "4",
      type: "drill",
      title: "Completed Serve Accuracy",
      description: "Hit 8/10 targets",
      date: "2024-02-17",
      sport: "Volleyball",
    },
  ],
  achievements: [
    { id: "1", title: "First Goal!", icon: "Target", earnedDate: "2024-01-15" },
    { id: "2", title: "Week Warrior", icon: "Calendar", earnedDate: "2024-01-22" },
    { id: "3", title: "Multi-Sport Master", icon: "Trophy", earnedDate: "2024-02-01" },
    { id: "4", title: "Century Club", icon: "Award", earnedDate: "2024-02-15" },
  ],
}
