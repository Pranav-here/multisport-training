export interface AthleteHighlight {
  id: string
  title: string
  description: string
  videoUrl?: string
  thumbnail?: string
}

export interface CareerStat {
  label: string
  value: string
  subtext?: string
}

export interface AthleteProfile {
  id: string
  name: string
  sport: string
  position: string
  team: string
  number?: number
  biography: string
  avatar: string
  coverImage: string
  achievements: string[]
  careerStats: CareerStat[]
  recentHighlights: AthleteHighlight[]
  focusAreas: string[]
}

export const athleteProfiles: Record<string, AthleteProfile> = {
  lebron: {
    id: "lebron",
    name: "LeBron James",
    sport: "Basketball",
    position: "Forward",
    team: "Los Angeles Lakers",
    number: 23,
    biography:
      "Four-time NBA champion, four-time league MVP, and the league's all-time leading scorer. LeBron continues to set the standard for longevity, leadership, and playmaking at the highest level.",
    avatar: "/placeholder-user.jpg",
    coverImage: "/sports-training-video.png",
    achievements: [
      "4× NBA Champion",
      "4× NBA Most Valuable Player",
      "4× NBA Finals MVP",
      "20× NBA All-Star selection",
      "2× Olympic Gold Medalist",
    ],
    careerStats: [
      { label: "Career Points", value: "40,000+", subtext: "All-time NBA scoring leader" },
      { label: "Assists", value: "10,800+", subtext: "Top-5 all time" },
      { label: "Rebounds", value: "11,200+", subtext: "Elite two-way presence" },
      { label: "Seasons", value: "21", subtext: "Entering season 22 in 2024-25" },
    ],
    recentHighlights: [
      {
        id: "highlight-1",
        title: "Shoulder Finisher Micro-Session",
        description:
          "LeBron's post-game maintenance drill to keep his shoulders healthy and explosive through long seasons.",
        videoUrl: "/james-drill.mp4",
        thumbnail: "/sports-training-video.png",
      },
      {
        id: "highlight-2",
        title: "Clutch Playmaking vs. Nuggets",
        description: "Rewatch the final sequences from the 4th quarter comeback led by LeBron's court vision.",
        thumbnail: "/basketball-player-jumping-for-dunk.png",
      },
    ],
    focusAreas: ["Explosiveness", "Core Stability", "Leadership", "Recovery & Longevity"],
  },
}

export function getAthleteProfile(id: string): AthleteProfile | undefined {
  return athleteProfiles[id.toLowerCase()]
}
