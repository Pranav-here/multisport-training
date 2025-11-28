import { cache } from 'react'

import { levelSchema, progressSchema, worldSchema, type Level, type Progress, type World, type Nudge } from './types'

const WORLDS: World[] = [
  { id: 'grassroots', slug: 'grassroots', title: 'Grassroots', range: [1, 20] },
  { id: 'tactical', slug: 'tactical', title: 'Tactical Engines', range: [21, 40] },
  { id: 'final-third', slug: 'final-third', title: 'Final Third', range: [41, 60] },
  { id: 'conditioning', slug: 'conditioning', title: 'Relentless Conditioning', range: [61, 80] },
  { id: 'pressure', slug: 'pressure', title: 'Pressure Proofing', range: [81, 100] },
  { id: 'legacy', slug: 'legacy', title: 'Legacy Circuit', range: [101, 120] },
].map((world) => worldSchema.parse(world))

const milestones = new Set([10, 40, 60, 80, 100, 120])

const sampleObjectives = [
  'Complete three rounds of quick touches.',
  'Upload a 45-second highlight clip.',
  'Log two tactical adjustments for the next session.',
  'Execute five clean through balls under pressure.',
  'Finish a ladder drill with under 40s split.',
  'Review and annotate match tape for one teammate.',
  'Run a 60-second high press and recover drill.',
]

const titles = [
  'First Touch Flow',
  'Passing Lane Pulse',
  'Final Third Switch',
  'Press Break Escape',
  'Tempo Surge',
  'Championship Mindset',
  'Legacy Loop',
]

const statusCycle: Array<Level['status']> = ['complete', 'in_progress', 'unlocked', 'locked']

const createLevel = (levelNumber: number): Level => {
  const world = WORLDS.find((entry) => levelNumber >= entry.range[0] && levelNumber <= entry.range[1]) ?? WORLDS[0]
  const status = statusCycle[(levelNumber + 1) % statusCycle.length]
  const estMinutes = 8 + (levelNumber % 4) * 2
  const difficulty = ((levelNumber + world.range[0]) % 5) + 1
  const objectives = sampleObjectives.slice(0, 2 + ((levelNumber + 1) % 3))
  const title = `${titles[levelNumber % titles.length]}`

  const level: Level = levelSchema.parse({
    id: `level-${levelNumber}`,
    number: levelNumber,
    worldId: world.id,
    title: milestones.has(levelNumber) ? `${title} · Milestone` : title,
    objectives,
    estMinutes,
    difficulty,
    status: levelNumber === 1 ? 'in_progress' : levelNumber < 6 ? 'unlocked' : status,
    score: Math.min(100, Math.max(0, 70 + ((levelNumber * 7) % 30))),
    tags: ['touches', 'drills', levelNumber % 2 === 0 ? 'movement' : 'finishing'],
    coachNotes:
      levelNumber % 5 === 0
        ? 'Focus on two-footed control and scan before every reception. Keep the midfield lane open.'
        : undefined,
    media:
      levelNumber % 4 === 0
        ? {
            url: 'https://storage.googleapis.com/athletiqs-demo/progression/sample-drill.mp4',
            poster: 'https://storage.googleapis.com/athletiqs-demo/progression/poster.jpg',
            type: 'video' as const,
          }
        : undefined,
  })

  return level
}

const LEVELS: Level[] = Array.from({ length: 120 }, (_, index) => createLevel(index + 1))

const PROGRESS: Progress = progressSchema.parse({
  currentLevelId: 'level-3',
  streakDays: 4,
  completedCount: 37,
  arcPercent: WORLDS.reduce<Record<string, number>>((acc, world) => {
    acc[world.id] = Math.min(1, Math.max(0, (world.range[0] - 1) / 120 + 0.1))
    return acc
  }, {}),
  lastPlayedAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
})

const NUDGES: Nudge[] = [
  {
    id: 'cycle',
    title: 'Lock your weekly cycle',
    description: 'Pick three levels, drop them on your training week, and commit.',
    actionLabel: 'Open planner',
    href: '#planner',
  },
  {
    id: 'edge',
    title: 'Document your edge',
    description: 'Upload a 30-second clip for feedback on your next milestone.',
    actionLabel: 'Upload clip',
    href: '/dashboard#upload',
  },
  {
    id: 'cross-train',
    title: 'Cross-train smart',
    description: 'Blend conditioning reps with creativity bursts to avoid plateaus.',
    actionLabel: 'View drills',
    href: '/drills',
  },
]

const resolveAfter = async <T>(value: T, timeout = 120) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), timeout))

export const listWorlds = () => WORLDS

export const listLevels = cache(async (): Promise<Level[]> => {
  return resolveAfter(LEVELS)
})

export const getLevel = cache(async (id: string): Promise<Level | undefined> => {
  const level = LEVELS.find((entry) => entry.id === id)
  return resolveAfter(level)
})

export const getProgress = cache(async (): Promise<Progress> => {
  return resolveAfter(PROGRESS)
})

export const listNudges = cache(async (): Promise<Nudge[]> => {
  return resolveAfter(NUDGES, 80)
})
