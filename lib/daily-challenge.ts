import type { Challenge } from '@/lib/mock-data'

export const SUPPORTED_DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export type SupportedDifficulty = (typeof SUPPORTED_DIFFICULTIES)[number]

export const fallbackSports: Array<{ slug: string; name: string }> = [
  { slug: 'soccer', name: 'Soccer' },
  { slug: 'basketball', name: 'Basketball' },
  { slug: 'tennis', name: 'Tennis' },
  { slug: 'running', name: 'Running' },
  { slug: 'cricket', name: 'Cricket' },
]

const sportThumbnails: Record<string, string> = {
  soccer: '/soccer-ball-control-challenge.png',
  basketball: '/basketball-player-jumping-for-dunk.png',
  tennis: '/tennis-player-hitting-backhand-slice.png',
  running: '/daily-sports-challenge.png',
  cricket: '/sports-training-video.png',
  volleyball: '/volleyball-player-serving-ball.png',
  strength: '/sports-training-video.png',
}

export interface FallbackChallengeDefinition {
  title: string
  description: string
  instructions: string[]
  difficulty: SupportedDifficulty
  points: number
}

const fallbackChallenges: Record<string, FallbackChallengeDefinition[]> = {
  soccer: [
    {
      title: 'One-Touch Triangle Rondo',
      description: 'Build tempo and awareness by working quick one-touch passes in a tight 3-player triangle.',
      instructions: [
        'Set up three cones in a triangle about 8 yards apart and work one-touch passes clockwise for 90 seconds.',
        'Switch direction and repeat, focusing on scanning the field before the pass.',
        'Add a passive defender to increase pressure once rhythm is consistent.',
      ],
      difficulty: 'medium',
      points: 70,
    },
    {
      title: 'Crossbar Weak-Foot Challenge',
      description: 'Strengthen your weaker foot by aiming for the crossbar from the edge of the box.',
      instructions: [
        'Take 10 attempts from the top of the box using only your weaker foot.',
        'Reset quickly between reps to mimic game tempo and maintain balance over the plant foot.',
        'Record how many times you strike the bar or come within a yard and try to beat the score tomorrow.',
      ],
      difficulty: 'hard',
      points: 95,
    },
    {
      title: 'Agility Gates & Finish',
      description: 'Combine quick feet with a composed finish to simulate breaking through traffic and scoring.',
      instructions: [
        'Lay out four cones as mini gates 2 yards apart and sprint through them with quick lateral cuts.',
        'Receive a pass (or roll a ball to yourself) and finish first-time on goal from 12 yards.',
        'Complete 8 quality reps focusing on posture, plant steps, and clean striking contact.',
      ],
      difficulty: 'medium',
      points: 80,
    },
  ],
  basketball: [
    {
      title: 'Under Pressure Catch & Shoot',
      description: 'Sharpen your shot release by simulating game-speed catches from multiple spots on the arc.',
      instructions: [
        'Place five markers around the three-point line and take two catch-and-shoot attempts from each.',
        'Hold your follow-through and track your makes to set a personal benchmark.',
        'Add a jab-step or rip-through before the shot on the second rotation for added difficulty.',
      ],
      difficulty: 'medium',
      points: 75,
    },
    {
      title: 'Two-Ball Rhythm Challenge',
      description: 'Elevate ball control by alternating speed dribbles with both hands in tight windows.',
      instructions: [
        'Perform 30 seconds of synchronized low dribbles, then 30 seconds of alternating crossovers.',
        'Stay in a strong stance with eyes up the entire time; repeat the set three times with 20 seconds rest.',
        'Finish with 20 power dribbles on each hand to reinforce control under fatigue.',
      ],
      difficulty: 'easy',
      points: 60,
    },
  ],
  tennis: [
    {
      title: 'Serve Toss Consistency Test',
      description: 'Dial in your serve toss rhythm to set up a reliable first serve under match conditions.',
      instructions: [
        'Stand at the baseline and perform 15 consecutive tosses, catching the ball at peak height without swinging.',
        'Mark any toss that drifts more than a racquet length forward or backward and adjust immediately.',
        'Finish with 10 full serves, aiming for 70% first-serve accuracy with the same toss placement.',
      ],
      difficulty: 'easy',
      points: 55,
    },
    {
      title: 'Baseline Depth Battle',
      description: 'Build depth control by alternating heavy topspin drives with low, skidding slices.',
      instructions: [
        'Rally crosscourt for 12 balls, aiming to land beyond the service line on every shot.',
        'Switch to down-the-line targets without dropping depth, keeping footwork light and balanced.',
        'End with 10 approach-and-volley pairs, finishing each point at the net with controlled punch volleys.',
      ],
      difficulty: 'medium',
      points: 70,
    },
  ],
  running: [
    {
      title: 'Negative Split Tempo Run',
      description: 'Train pacing intelligence by finishing your run faster than you started.',
      instructions: [
        'Warm up for 8 minutes at conversational pace, focusing on tall posture.',
        'Run 12 minutes at a steady effort, then finish with 8 minutes slightly faster without sprinting.',
        'Cool down with a light jog and 3 x 20-second strides, tracking splits in your training log.',
      ],
      difficulty: 'medium',
      points: 65,
    },
    {
      title: 'Stride Mechanics Tune-Up',
      description: 'Reinforce upright posture and mid-foot contact with short, high-quality stride reps.',
      instructions: [
        'Complete dynamic drills (A-skips, B-skips, high knees) for 2 minutes to prime mechanics.',
        'Run 8 x 20-second strides at 5K pace with 40 seconds walk-back recoveries.',
        'Track cadence or count steps for the middle strides, aiming for smooth turnover and relaxed arms.',
      ],
      difficulty: 'easy',
      points: 50,
    },
  ],
  cricket: [
    {
      title: 'Target Bowling Accuracy Grid',
      description: 'Refine line and length by hitting specific channels with repeatable mechanics.',
      instructions: [
        'Place three markers on a good length and bowl 12 deliveries, aiming to land on each target four times.',
        'Record your misses and adjust grip pressure or run-up speed to tighten accuracy.',
        'Finish with 6 yorkers to the base of off stump, keeping follow-through balanced.',
      ],
      difficulty: 'medium',
      points: 85,
    },
    {
      title: 'Power Hitting Interval',
      description: 'Train controlled aggression by alternating boundary swings with gap placements.',
      instructions: [
        'Face 18 throw-downs or machine balls: rotate six power shots, six placement drives, six lofted flicks.',
        'Track exit direction and make micro-adjustments to stance width to stay balanced.',
        'Close with 10 quick singles sprinting hard through the crease to reinforce intensity.',
      ],
      difficulty: 'hard',
      points: 95,
    },
  ],
}

export function seededRandom(seed: string) {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 4294967295
}

export function chooseFallbackChallenge(sportSlug: string, seed: string): FallbackChallengeDefinition | null {
  const catalog = fallbackChallenges[sportSlug]
  if (!catalog || catalog.length === 0) {
    return null
  }
  const randomIndex = Math.floor(seededRandom(`${seed}-${sportSlug}`) * catalog.length)
  return catalog[randomIndex]
}

export function normalizeDifficulty(input: string | undefined): SupportedDifficulty {
  if (!input) {
    return 'medium'
  }
  const normalized = input.trim().toLowerCase()
  if (SUPPORTED_DIFFICULTIES.includes(normalized as SupportedDifficulty)) {
    return normalized as SupportedDifficulty
  }
  return 'medium'
}

export function selectThumbnail(sportSlug: string) {
  const normalized = sportSlug.toLowerCase()
  return sportThumbnails[normalized] ?? '/daily-sports-challenge.png'
}

export function formatLocalDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const parts = format.formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<string, string>

  const asUTC = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  )

  return asUTC - date.getTime()
}

export function computeDeadlineIso(localDate: string, timeZone: string) {
  const [year, month, day] = localDate.split('-').map((value) => Number(value))
  const nextDayUtc = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0))
  const offset = getTimeZoneOffsetMs(nextDayUtc, timeZone)
  const zonedMidnight = new Date(nextDayUtc.getTime() - offset)
  return zonedMidnight.toISOString()
}

export interface GenerateFallbackChallengeOptions {
  userId: string
  timeZone?: string
  sports?: Array<{ slug: string; name: string }>
  now?: Date
  idPrefix?: string
}

export function generateFallbackChallenge(options: GenerateFallbackChallengeOptions): Challenge {
  const now = options.now ?? new Date()
  const timeZone = options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
  const localDate = formatLocalDate(now, timeZone)
  const seed = `${options.userId}-${localDate}`

  const sportsCatalog =
    options.sports && options.sports.length > 0
      ? options.sports
      : fallbackSports

  let sportSlug = sportsCatalog[0]?.slug ?? fallbackSports[0].slug
  if (sportsCatalog.length > 1) {
    const candidateIndex = Math.floor(seededRandom(`${seed}-sport`) * sportsCatalog.length)
    sportSlug = sportsCatalog[candidateIndex]?.slug ?? sportSlug
  }

  if (!sportsCatalog.some((sport) => sport.slug === sportSlug)) {
    sportSlug = sportsCatalog[0]?.slug ?? fallbackSports[0].slug
  }

  const fallbackDetails =
    chooseFallbackChallenge(sportSlug, seed) ??
    chooseFallbackChallenge(fallbackSports[0].slug, seed)

  const sportLookup = new Map(sportsCatalog.map((sport) => [sport.slug, sport.name]))
  const defaultInstructions = [
    'Block 20 minutes for technical reps with controlled tempo.',
    'Capture a short clip of your best execution to review later.',
    'Log takeaways in your training notebook before midnight.',
  ]

  const challenge: Challenge = {
    id: `${options.idPrefix ?? 'daily'}-${localDate.replace(/-/g, '')}-${sportSlug}`,
    title: fallbackDetails?.title ?? 'Focused Skill Builder',
    description:
      fallbackDetails?.description ??
      'Dial in a key skill with focused reps that translate directly to game-day execution.',
    sport: sportLookup.get(sportSlug) ?? sportSlug,
    sportSlug,
    difficulty: fallbackDetails?.difficulty ?? 'medium',
    points: fallbackDetails?.points ?? 80,
    participants: Math.round(500 + seededRandom(`${seed}-${sportSlug}-participants`) * 4500),
    thumbnail: selectThumbnail(sportSlug),
    instructions: [...(fallbackDetails?.instructions ?? defaultInstructions)],
    challengeDate: localDate,
    timeZone,
    generatedAt: now.toISOString(),
    deadline: computeDeadlineIso(localDate, timeZone),
  }

  return challenge
}

