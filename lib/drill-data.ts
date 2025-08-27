export interface Drill {
  id: string
  title: string
  sport: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: string
  equipment: string[]
  description: string
  steps: string[]
  videoUrl: string
  thumbnail: string
  coachingCues: string[]
  safetyTips: string[]
  targetSkills: string[]
}

export interface DrillAttempt {
  id: string
  drillId: string
  date: string
  reps?: number
  sets?: number
  distance?: number
  accuracy?: number
  notes: string
  videoClip?: string
}

export interface ProgressData {
  xp: number
  level: number
  xpToNextLevel: number
  totalXp: number
  streakCalendar: { date: string; completed: boolean }[]
  recentSessions: { date: string; xp: number; sport: string }[]
  skillRadar: { skill: string; value: number; maxValue: number }[]
  badges: { id: string; name: string; icon: string; earnedDate: string }[]
}

export const mockDrills: Record<string, Drill[]> = {
  soccer: [
    {
      id: "soccer-1",
      title: "First Touch Control",
      sport: "Soccer",
      difficulty: "beginner",
      duration: "15 min",
      equipment: ["Soccer ball", "Cones (optional)"],
      description: "Master your first touch with both feet to improve ball control and reaction time.",
      steps: [
        "Set up in a 10x10 yard square",
        "Have a partner or wall to pass the ball from",
        "Receive the ball with your right foot, controlling it within 2 touches",
        "Repeat with your left foot",
        "Progress to receiving balls from different angles",
        "Focus on cushioning the ball and keeping it close",
      ],
      videoUrl: "/soccer-first-touch-demo.mp4",
      thumbnail: "/soccer-first-touch-drill.png",
      coachingCues: [
        "Keep your head up to see the ball coming",
        "Use the inside of your foot for better control",
        "Bend your knee slightly to cushion the ball",
        "Take your first touch away from pressure",
      ],
      safetyTips: [
        "Warm up properly before starting",
        "Stay hydrated during practice",
        "Use proper footwear with good grip",
      ],
      targetSkills: ["Ball Control", "First Touch", "Coordination"],
    },
    {
      id: "soccer-2",
      title: "Cone Weaving Dribbling",
      sport: "Soccer",
      difficulty: "intermediate",
      duration: "20 min",
      equipment: ["Soccer ball", "6-8 cones"],
      description: "Improve close ball control and agility through cone weaving exercises.",
      steps: [
        "Set up 6-8 cones in a straight line, 2 yards apart",
        "Start at one end with the ball at your feet",
        "Dribble through the cones using only your right foot",
        "Return using only your left foot",
        "Progress to using both feet alternately",
        "Time yourself and try to improve each round",
      ],
      videoUrl: "/soccer-cone-weaving-demo.mp4",
      thumbnail: "/soccer-cone-weaving-drill.png",
      coachingCues: [
        "Keep the ball close to your feet",
        "Use small touches to maintain control",
        "Keep your head up between touches",
        "Accelerate out of the final cone",
      ],
      safetyTips: [
        "Ensure cones are properly spaced",
        "Watch for other players in the area",
        "Start slowly and build up speed",
      ],
      targetSkills: ["Dribbling", "Agility", "Ball Control", "Speed"],
    },
  ],
  basketball: [
    {
      id: "basketball-1",
      title: "Vertical Jump Training",
      sport: "Basketball",
      difficulty: "intermediate",
      duration: "25 min",
      equipment: ["Basketball", "Measuring tape (optional)"],
      description: "Build explosive power and improve your vertical jump for better rebounding and dunking.",
      steps: [
        "Start with a 5-minute dynamic warm-up",
        "Perform 3 sets of 10 squat jumps",
        "Do 3 sets of 8 tuck jumps",
        "Practice 3 sets of 5 depth jumps from a 12-inch box",
        "Finish with 3 sets of maximum vertical jumps",
        "Cool down with light stretching",
      ],
      videoUrl: "/basketball-vertical-jump-demo.mp4",
      thumbnail: "/basketball-vertical-jump-drill.png",
      coachingCues: [
        "Land softly on the balls of your feet",
        "Use your arms to generate momentum",
        "Focus on explosive upward movement",
        "Keep your core engaged throughout",
      ],
      safetyTips: [
        "Always warm up before jumping exercises",
        "Land with bent knees to absorb impact",
        "Stop if you feel any joint pain",
        "Use proper athletic shoes",
      ],
      targetSkills: ["Vertical Jump", "Explosive Power", "Leg Strength"],
    },
    {
      id: "basketball-2",
      title: "Free Throw Shooting",
      sport: "Basketball",
      difficulty: "beginner",
      duration: "30 min",
      equipment: ["Basketball", "Basketball hoop"],
      description: "Develop consistent free throw shooting form and improve your percentage from the line.",
      steps: [
        "Position yourself at the free throw line",
        "Establish your shooting stance with feet shoulder-width apart",
        "Hold the ball with your shooting hand under the ball, guide hand on the side",
        "Focus on the back of the rim",
        "Shoot with consistent form, following through with your wrist",
        "Track your makes and misses out of 20 shots",
      ],
      videoUrl: "/basketball-free-throw-demo.mp4",
      thumbnail: "/basketball-free-throw-drill.png",
      coachingCues: [
        "Keep your elbow under the ball",
        "Follow through with a 'cookie jar' motion",
        "Use the same routine every time",
        "Focus on arc - aim for 45-50 degrees",
      ],
      safetyTips: [
        "Check that the area around the hoop is clear",
        "Retrieve balls safely",
        "Stay hydrated during practice",
      ],
      targetSkills: ["Shooting Accuracy", "Mental Focus", "Consistency"],
    },
  ],
  volleyball: [
    {
      id: "volleyball-1",
      title: "Serve Accuracy Challenge",
      sport: "Volleyball",
      difficulty: "intermediate",
      duration: "20 min",
      equipment: ["Volleyball", "Target markers", "Net"],
      description: "Improve serving accuracy by targeting specific zones on the court.",
      steps: [
        "Set up target markers in the corners and middle of the opposite court",
        "Start with underhand serves to get warmed up",
        "Progress to overhand serves",
        "Aim for each target zone, 5 serves per zone",
        "Track your accuracy percentage for each zone",
        "Focus on consistent toss and contact point",
      ],
      videoUrl: "/volleyball-serve-accuracy-demo.mp4",
      thumbnail: "/volleyball-serve-accuracy-drill.png",
      coachingCues: [
        "Toss the ball consistently in front of your hitting shoulder",
        "Contact the ball at the highest point",
        "Follow through in the direction of your target",
        "Keep your serving motion smooth and controlled",
      ],
      safetyTips: [
        "Warm up your shoulder before serving",
        "Check that the net is properly secured",
        "Be aware of other players on the court",
      ],
      targetSkills: ["Serve Accuracy", "Consistency", "Mental Focus"],
    },
  ],
  tennis: [
    {
      id: "tennis-1",
      title: "Backhand Slice Technique",
      sport: "Tennis",
      difficulty: "advanced",
      duration: "35 min",
      equipment: ["Tennis racket", "Tennis balls", "Tennis court"],
      description: "Master the backhand slice for better court positioning and defensive play.",
      steps: [
        "Start with shadow swings to practice the motion",
        "Use a continental grip for the slice",
        "Practice the high-to-low swing path",
        "Hit 20 balls focusing on contact point",
        "Work on slice depth and placement",
        "Practice slice approach shots",
      ],
      videoUrl: "/tennis-backhand-slice-demo.mp4",
      thumbnail: "/tennis-backhand-slice-drill.png",
      coachingCues: [
        "Keep your wrist firm through contact",
        "Brush down the back of the ball",
        "Follow through across your body",
        "Stay low and balanced",
      ],
      safetyTips: ["Warm up with light rallying first", "Wear proper tennis shoes", "Stay hydrated in hot weather"],
      targetSkills: ["Backhand Technique", "Ball Control", "Court Positioning"],
    },
  ],
}

export const mockProgressData: ProgressData = {
  xp: 2450,
  level: 8,
  xpToNextLevel: 550,
  totalXp: 3000,
  streakCalendar: [
    { date: "2024-01-01", completed: true },
    { date: "2024-01-02", completed: true },
    { date: "2024-01-03", completed: false },
    { date: "2024-01-04", completed: true },
    { date: "2024-01-05", completed: true },
    { date: "2024-01-06", completed: true },
    { date: "2024-01-07", completed: false },
    // ... more dates
  ],
  recentSessions: [
    { date: "Jan 7", xp: 120, sport: "Soccer" },
    { date: "Jan 6", xp: 95, sport: "Basketball" },
    { date: "Jan 5", xp: 110, sport: "Soccer" },
    { date: "Jan 4", xp: 85, sport: "Volleyball" },
    { date: "Jan 3", xp: 0, sport: "" },
    { date: "Jan 2", xp: 105, sport: "Tennis" },
    { date: "Jan 1", xp: 90, sport: "Soccer" },
  ],
  skillRadar: [
    { skill: "Control", value: 85, maxValue: 100 },
    { skill: "Speed", value: 72, maxValue: 100 },
    { skill: "Endurance", value: 68, maxValue: 100 },
    { skill: "Accuracy", value: 91, maxValue: 100 },
    { skill: "Agility", value: 78, maxValue: 100 },
    { skill: "Strength", value: 65, maxValue: 100 },
  ],
  badges: [
    { id: "1", name: "First Touch Master", icon: "⚽", earnedDate: "2 days ago" },
    { id: "2", name: "Week Warrior", icon: "🔥", earnedDate: "Today" },
    { id: "3", name: "Accuracy Ace", icon: "🎯", earnedDate: "1 week ago" },
  ],
}

export const mockDrillAttempts: DrillAttempt[] = [
  {
    id: "attempt-1",
    drillId: "soccer-1",
    date: "2024-01-07",
    reps: 20,
    sets: 3,
    accuracy: 85,
    notes: "Felt much more confident with left foot today",
  },
  {
    id: "attempt-2",
    drillId: "basketball-1",
    date: "2024-01-06",
    reps: 10,
    sets: 3,
    notes: "New personal best on vertical jump!",
  },
]
