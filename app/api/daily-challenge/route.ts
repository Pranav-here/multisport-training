import { NextResponse } from 'next/server'

import { z } from 'zod'

import { createServerClient } from '@/lib/supabase-server'

const challengeSchema = z.object({
  title: z.string().min(6),
  description: z.string().min(16),
  sport: z.string().min(2),
  difficulty: z.enum(['easy', 'medium', 'hard']).catch('medium'),
  points: z.number().int().min(10).max(500).catch(75),
  instructions: z.array(z.string().min(6)).min(2).max(6),
})

const SUPPORTED_DIFFICULTIES = ['easy', 'medium', 'hard'] as const

type SupportedDifficulty = (typeof SUPPORTED_DIFFICULTIES)[number]

type SupabaseSportRow = {
  sport_id: number
  sports: {
    slug: string
    name: string
  } | null
}

const fallbackSports = [
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

const fallbackChallenges: Record<
  string,
  Array<{
    title: string
    description: string
    instructions: string[]
    difficulty: SupportedDifficulty
    points: number
  }>
> = {
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
      description:
        'Dial in your serve toss rhythm to set up a reliable first serve under match conditions.',
      instructions: [
        'Stand at the baseline and perform 15 consecutive tosses, catching the ball at peak height without swinging.',
        'Mark any toss that drifts more than a racquet length forward or backward and adjust immediately.',
        'Finish with 10 full serves, aiming for 70% first-serve accuracy with the same toss placement.',
      ],
      difficulty: 'easy',
      points: 55,
    },
    {
      title: 'Baseline Depth Ladder',
      description: 'Train depth control by landing rally balls in progressively smaller target zones.',
      instructions: [
        'Lay down two towels creating a landing zone 3 feet from the baseline.',
        'Hit 20 forehands and 20 backhands aiming to land inside the zone with solid net clearance.',
        'Shrink the zone by a foot and complete another 10 balls on each side, keeping rally tempo high.',
      ],
      difficulty: 'medium',
      points: 85,
    },
  ],
  running: [
    {
      title: 'Negative Split Tempo Run',
      description: 'Build pacing mastery by finishing stronger than you start during a structured mid-distance run.',
      instructions: [
        'Run 2 km at an easy conversational pace to warm up the aerobic system.',
        'Complete 3 km at tempo pace, ensuring the final kilometer is 10–15 seconds faster than the first.',
        'Cool down with a 1 km jog and mobility routine focusing on calves and hip flexors.',
      ],
      difficulty: 'medium',
      points: 90,
    },
    {
      title: 'Hill Sprint Circuit',
      description: 'Boost explosive power with short hill accelerations and walk-back recoveries.',
      instructions: [
        'Find a hill with a moderate incline and mark a 40-meter segment.',
        'Complete 8 sprint reps up the hill at 90% effort with controlled walk-back recoveries.',
        'Finish with 3 form-focused strides on flat ground emphasizing tall posture and quick turnover.',
      ],
      difficulty: 'hard',
      points: 100,
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

function seededRandom(seed: string) {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 4294967295
}

function chooseFallbackChallenge(sportSlug: string, seed: string) {
  const catalog = fallbackChallenges[sportSlug]
  if (!catalog || !catalog.length) {
    return null
  }
  const randomIndex = Math.floor(seededRandom(`${seed}-${sportSlug}`) * catalog.length)
  return catalog[randomIndex]
}

function normalizeDifficulty(input: string | undefined): SupportedDifficulty {
  if (!input) {
    return 'medium'
  }
  const normalized = input.trim().toLowerCase()
  if (SUPPORTED_DIFFICULTIES.includes(normalized as SupportedDifficulty)) {
    return normalized as SupportedDifficulty
  }
  return 'medium'
}

function selectThumbnail(sportSlug: string) {
  const normalized = sportSlug.toLowerCase()
  return sportThumbnails[normalized] ?? '/daily-sports-challenge.png'
}

function formatLocalDate(date: Date, timeZone: string) {
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

function computeDeadlineIso(localDate: string, timeZone: string) {
  const [year, month, day] = localDate.split('-').map((value) => Number(value))
  const nextDayUtc = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0))
  const offset = getTimeZoneOffsetMs(nextDayUtc, timeZone)
  const zonedMidnight = new Date(nextDayUtc.getTime() - offset)
  return zonedMidnight.toISOString()
}

function extractJsonBlock(content: string) {
  if (!content) return null

  const sanitized = content.replace(/```json|```/gi, '').trim()
  const match = sanitized.match(/\{[\s\S]*\}/)
  if (!match) {
    return null
  }

  try {
    return JSON.parse(match[0])
  } catch (error) {
    console.warn('[daily-challenge] failed to parse JSON', error)
    return null
  }
}

async function callGroq(payload: {
  sports: Array<{ slug: string; name: string }>
  localDate: string
  timeZone: string
  seed: string
}) {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) {
    throw new Error('Groq API key not configured')
  }

  const sportList = payload.sports
  const sportsSummary = sportList.map((sport) => `${sport.name} (slug: "${sport.slug}")`).join(', ')

  const systemPrompt =
    'You are a multi-sport performance coach creating one daily training challenge for competitive teen athletes.'

  const userPrompt = [
    `Today is ${payload.localDate} for the athlete in time zone ${payload.timeZone}.`,
    'Choose exactly one sport from this list and create a fresh, practical challenge that can be done with minimal equipment.',
    `Available sports: ${sportsSummary}.`,
    'Respond with strict JSON (no markdown) using this structure:',
    `{"title": "...","description": "...","sport": "<use the provided sport slug exactly>","difficulty": "easy|medium|hard","points": <integer between 40 and 120>,"instructions": ["Step 1", "Step 2", "Step 3"]}`,
    'Keep instructions actionable (12-18 words), focus on skill quality, and make the challenge completable within 30-45 minutes.',
    `Make the output deterministic for seed ${payload.seed}.`,
  ].join(' ')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_DAILY_CHALLENGE_MODEL ?? 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Groq request failed: ${errorText}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const content = data.choices?.[0]?.message?.content
  const parsed = extractJsonBlock(content ?? '')
  if (!parsed) {
    return null
  }

  const validated = challengeSchema.safeParse(parsed)
  if (!validated.success) {
    console.warn('[daily-challenge] validation failed', validated.error.issues)
    return null
  }

  return validated.data
}

export async function GET(request: Request) {
  const supabase = createServerClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('[daily-challenge] failed to read session', sessionError)
    return NextResponse.json({ error: 'unable to verify session' }, { status: 500 })
  }

  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const timeZone = searchParams.get('tz') ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'

  const { data: sportsRows, error: sportsError } = await supabase
    .from('user_sports')
    .select('sport_id, sports (slug, name)')
    .eq('user_id', session.user.id)

  if (sportsError) {
    console.warn('[daily-challenge] could not load user sports', sportsError)
  }

  const sports: Array<{ slug: string; name: string; id?: number }> =
    sportsRows?.map((row: SupabaseSportRow) => {
      if (!row.sports) {
        return null
      }
      return {
        slug: row.sports.slug,
        name: row.sports.name,
        id: row.sport_id,
      }
    }).filter((value): value is { slug: string; name: string; id?: number } => Boolean(value)) ??
    fallbackSports

  let localDate: string
  try {
    localDate = formatLocalDate(new Date(), timeZone)
  } catch (error) {
    console.warn('[daily-challenge] invalid timezone provided, falling back to UTC', timeZone, error)
    localDate = formatLocalDate(new Date(), 'UTC')
  }
  const seed = `${session.user.id}-${localDate}`

  let generatedChallenge = null
  try {
    if (process.env.GROQ_API_KEY) {
      generatedChallenge = await callGroq({ sports, localDate, timeZone, seed })
    }
  } catch (error) {
    console.error('[daily-challenge] Groq generation failed', error)
  }

  let sportSlug = generatedChallenge?.sport ?? sports[0]?.slug ?? fallbackSports[0].slug
  if (!sports.some((sport) => sport.slug === sportSlug)) {
    sportSlug = sports[0]?.slug ?? fallbackSports[0].slug
  }

  const difficulty = normalizeDifficulty(generatedChallenge?.difficulty)
  const title = generatedChallenge?.title ?? 'Focused Skill Builder'
  const description =
    generatedChallenge?.description ??
    'Dial in a key skill with focused reps that translate directly to game-day execution.'
  const instructions =
    generatedChallenge?.instructions ??
    chooseFallbackChallenge(sportSlug, seed)?.instructions ??
    [
      'Block 20 minutes for technical reps with controlled tempo.',
      'Capture a short clip of your best execution to review later.',
      'Log takeaways in your training notebook before midnight.',
    ]

  const fallbackDetails = generatedChallenge
    ? null
    : chooseFallbackChallenge(sportSlug, seed) ?? chooseFallbackChallenge(fallbackSports[0].slug, seed)

  const points = generatedChallenge?.points
    ? Math.max(40, Math.min(150, generatedChallenge.points))
    : fallbackDetails?.points ?? 80

  const participants = Math.round(500 + seededRandom(`${seed}-${sportSlug}-participants`) * 4500)

  const resolvedSportsMap = new Map(sports.map((sport) => [sport.slug, sport.name]))
  const sportName = resolvedSportsMap.get(sportSlug) ?? sportSlug
  const thumbnail = selectThumbnail(sportSlug)

  let deadlineIso: string
  try {
    deadlineIso = computeDeadlineIso(localDate, timeZone)
  } catch (error) {
    console.warn('[daily-challenge] failed to compute deadline, falling back to UTC', error)
    deadlineIso = computeDeadlineIso(localDate, 'UTC')
  }

  const challenge = {
    id: `daily-${localDate.replace(/-/g, '')}-${sportSlug}`,
    title,
    description,
    sport: sportName,
    sportSlug,
    difficulty,
    points,
    participants,
    thumbnail,
    instructions,
    challengeDate: localDate,
    timeZone,
    generatedAt: new Date().toISOString(),
    deadline: deadlineIso,
  }

  return NextResponse.json({ challenge })
}
