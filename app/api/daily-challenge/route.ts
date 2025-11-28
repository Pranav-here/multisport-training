import { NextResponse } from 'next/server'

import { z } from 'zod'

import {
  chooseFallbackChallenge,
  computeDeadlineIso,
  fallbackSports,
  formatLocalDate,
  normalizeDifficulty,
  seededRandom,
  selectThumbnail,
} from '@/lib/daily-challenge'
import { createServerClient } from '@/lib/supabase-server'

const challengeSchema = z.object({
  title: z.string().min(6),
  description: z.string().min(16),
  sport: z.string().min(2),
  difficulty: z.enum(['easy', 'medium', 'hard']).catch('medium'),
  points: z.number().int().min(10).max(500).catch(75),
  instructions: z.array(z.string().min(6)).min(2).max(6),
})

type SupabaseSportRow = {
  sport_id: number
  sports: {
    slug: string
    name: string
  } | null
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
  const supabase = await createServerClient()
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
    console.error('[daily-challenge] failed to load user sports', sportsError)
    return NextResponse.json(
      { error: 'Unable to load your sports preferences. Please try again or update your profile.' },
      { status: 500 }
    )
  }

  const sportsFromDb = ((sportsRows ?? []) as SupabaseSportRow[])
    .filter(
      (row): row is SupabaseSportRow & { sports: { slug: string; name: string } } => Boolean(row.sports),
    )
    .map((row) => ({
      slug: row.sports.slug,
      name: row.sports.name,
      id: row.sport_id,
    }))

  const sports: Array<{ slug: string; name: string; id?: number }> =
    sportsFromDb.length > 0 ? sportsFromDb : fallbackSports

  const usingSportsFallback = sportsFromDb.length === 0
  if (usingSportsFallback) {
    console.warn('[daily-challenge] user has no sports configured, using fallback sports')
  }

  let localDate: string
  try {
    localDate = formatLocalDate(new Date(), timeZone)
  } catch (error) {
    console.warn('[daily-challenge] invalid timezone provided, falling back to UTC', timeZone, error)
    localDate = formatLocalDate(new Date(), 'UTC')
  }
  const seed = `${session.user.id}-${localDate}`

  if (!process.env.GROQ_API_KEY) {
    console.error('[daily-challenge] GROQ_API_KEY not configured')
    return NextResponse.json(
      { error: 'Challenge generation service not configured. Please contact support.' },
      { status: 503 }
    )
  }

  let generatedChallenge = null
  try {
    generatedChallenge = await callGroq({ sports, localDate, timeZone, seed })
  } catch (error) {
    console.error('[daily-challenge] Groq generation failed', error)
    return NextResponse.json(
      { error: 'Failed to generate challenge. Please try again in a moment.' },
      { status: 500 }
    )
  }

  if (!generatedChallenge) {
    console.error('[daily-challenge] Groq returned null challenge')
    return NextResponse.json(
      { error: 'Failed to generate a valid challenge. Please try again.' },
      { status: 500 }
    )
  }

  let sportSlug = generatedChallenge.sport
  if (!sports.some((sport) => sport.slug === sportSlug)) {
    console.warn('[daily-challenge] Generated sport not in user sports, using first sport')
    sportSlug = sports[0].slug
  }

  const difficulty = normalizeDifficulty(generatedChallenge.difficulty)
  const title = generatedChallenge.title
  const description = generatedChallenge.description
  const instructions = generatedChallenge.instructions
  const points = Math.max(40, Math.min(150, generatedChallenge.points))

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

  return NextResponse.json({
    challenge,
    metadata: {
      usingSportsFallback,
      generatedByAI: true,
    },
  })
}

