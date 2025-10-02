import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

function loadEnvFile(path) {
  try {
    const raw = readFileSync(path, "utf8")
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue
      const idx = line.indexOf('=')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (!process.env[key] && value.length) {
        process.env[key] = value
      }
    }
  } catch (error) {
    console.warn(`Could not load env file at ${path}: ${error.message}`)
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

async function resolveAdminUserId() {
  if (process.env.SEED_ADMIN_USER_ID) {
    return process.env.SEED_ADMIN_USER_ID
  }

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
  if (error) {
    throw new Error(`Unable to list users: ${error.message}`)
  }

  const user = data.users?.[0]
  if (!user) {
    throw new Error('No users found in project. Create at least one user before seeding.')
  }

  return user.id
}

async function ensureProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to check profile: ${error.message}`)
  }

  if (!data) {
    const { error: insertError } = await supabase.from('profiles').insert({ id: userId })
    if (insertError) {
      throw new Error(`Failed to create profile for ${userId}: ${insertError.message}`)
    }
  }
}

const sportIdCache = new Map()
async function getSportId(slug) {
  if (sportIdCache.has(slug)) return sportIdCache.get(slug)
  const { data, error } = await supabase
    .from('sports')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (error || !data) {
    throw new Error(`Unable to locate sport '${slug}'`)
  }
  sportIdCache.set(slug, data.id)
  return data.id
}

const drillIdCache = new Map()
async function getDrillId(slug) {
  if (drillIdCache.has(slug)) return drillIdCache.get(slug)
  const { data, error } = await supabase
    .from('drills')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (error || !data) {
    throw new Error(`Unable to locate drill '${slug}'`)
  }
  drillIdCache.set(slug, data.id)
  return data.id
}

async function seedDrills(adminUserId) {
  const drills = [
    {
      slug: 'soccer-first-touch-control',
      title: 'First Touch Control',
      sport_id: await getSportId('soccer'),
      difficulty: 'beginner',
      duration_minutes: 15,
      equipment: ['Soccer ball', 'Cones (optional)'],
      description: 'Master your first touch with both feet to improve ball control and reaction time.',
      steps: [
        'Set up in a 10x10 yard square',
        'Have a partner or wall to pass the ball from',
        'Receive the ball with your right foot, controlling it within 2 touches',
        'Repeat with your left foot',
        'Progress to receiving balls from different angles',
        'Focus on cushioning the ball and keeping it close',
      ],
      video_url: '/soccer-first-touch-demo.mp4',
      thumbnail_url: '/soccer-first-touch-drill.png',
      coaching_cues: [
        'Keep your head up to see the ball coming',
        'Use the inside of your foot for better control',
        'Bend your knee slightly to cushion the ball',
        'Take your first touch away from pressure',
      ],
      safety_tips: [
        'Warm up properly before starting',
        'Stay hydrated during practice',
        'Use proper footwear with good grip',
      ],
      target_skills: ['Ball Control', 'First Touch', 'Coordination'],
      created_by: adminUserId,
    },
    {
      slug: 'soccer-cone-weaving',
      title: 'Cone Weaving Dribbling',
      sport_id: await getSportId('soccer'),
      difficulty: 'intermediate',
      duration_minutes: 20,
      equipment: ['Soccer ball', '6-8 cones'],
      description: 'Improve close ball control and agility through cone weaving exercises.',
      steps: [
        'Set up 6-8 cones in a straight line, 2 yards apart',
        'Start at one end with the ball at your feet',
        'Dribble through the cones using only your right foot',
        'Return using only your left foot',
        'Progress to using both feet alternately',
        'Time yourself and try to improve each round',
      ],
      video_url: '/soccer-cone-weaving-demo.mp4',
      thumbnail_url: '/soccer-cone-weaving-drill.png',
      coaching_cues: [
        'Keep the ball close to your feet',
        'Use small touches to maintain control',
        'Keep your head up between touches',
        'Accelerate out of the final cone',
      ],
      safety_tips: [
        'Ensure cones are properly spaced',
        'Watch for other players in the area',
        'Start slowly and build up speed',
      ],
      target_skills: ['Dribbling', 'Agility', 'Ball Control', 'Speed'],
      created_by: adminUserId,
    },
    {
      slug: 'basketball-vertical-jump',
      title: 'Vertical Jump Training',
      sport_id: await getSportId('basketball'),
      difficulty: 'intermediate',
      duration_minutes: 25,
      equipment: ['Basketball', 'Measuring tape (optional)'],
      description: 'Build explosive power and improve your vertical jump for better rebounding and dunking.',
      steps: [
        'Start with a 5-minute dynamic warm-up',
        'Perform 3 sets of 10 squat jumps',
        'Do 3 sets of 8 tuck jumps',
        'Practice 3 sets of 5 depth jumps from a 12-inch box',
        'Finish with 3 sets of maximum vertical jumps',
        'Cool down with light stretching',
      ],
      video_url: '/basketball-vertical-jump-demo.mp4',
      thumbnail_url: '/basketball-vertical-jump-drill.png',
      coaching_cues: [
        'Land softly on the balls of your feet',
        'Use your arms to generate momentum',
        'Focus on explosive upward movement',
        'Keep your core engaged throughout',
      ],
      safety_tips: [
        'Warm up thoroughly to protect your knees',
        'Use a stable box for depth jumps',
        'Rest between sets to maintain power output',
      ],
      target_skills: ['Explosiveness', 'Power', 'Jump Height'],
      created_by: adminUserId,
    },
    {
      slug: 'basketball-free-throw',
      title: 'Free Throw Consistency',
      sport_id: await getSportId('basketball'),
      difficulty: 'beginner',
      duration_minutes: 18,
      equipment: ['Basketball'],
      description: 'Focus on form and routine to boost free throw percentage.',
      steps: [
        'Start with 10 form-shooting reps close to the hoop',
        'Step back to the free-throw line and establish a routine',
        'Shoot sets of 5, tracking makes',
        'Pause between shots to reset form',
        'Finish with pressure shots — imagine game scenarios',
      ],
      video_url: '/basketball-free-throw-demo.mp4',
      thumbnail_url: '/basketball-free-throw-drill.png',
      coaching_cues: [
        'Keep eyes on the rim, not the ball',
        'Follow through with relaxed wrist',
        'Use legs for power, not just arms',
      ],
      safety_tips: [
        'Stretch shoulders before shooting',
        'Avoid overuse by limiting total reps',
        'Stay hydrated in long sessions',
      ],
      target_skills: ['Shooting Accuracy', 'Routine', 'Mental Focus'],
      created_by: adminUserId,
    },
    {
      slug: 'volleyball-serve-accuracy',
      title: 'Serve Accuracy Challenge',
      sport_id: await getSportId('volleyball'),
      difficulty: 'intermediate',
      duration_minutes: 20,
      equipment: ['Volleyball', 'Target markers', 'Net'],
      description: 'Improve serving accuracy by targeting specific zones on the court.',
      steps: [
        'Set up target markers in the corners and middle of the opposite court',
        'Start with underhand serves to get warmed up',
        'Progress to overhand serves',
        'Aim for each target zone, 5 serves per zone',
        'Track your accuracy percentage for each zone',
        'Focus on consistent toss and contact point',
      ],
      video_url: '/volleyball-serve-accuracy-demo.mp4',
      thumbnail_url: '/volleyball-serve-accuracy-drill.png',
      coaching_cues: [
        'Toss the ball consistently in front of your hitting shoulder',
        'Contact the ball at the highest point',
        'Follow through in the direction of your target',
        'Keep your serving motion smooth and controlled',
      ],
      safety_tips: [
        'Warm up your shoulder before serving',
        'Check that the net is properly secured',
        'Be aware of other players on the court',
      ],
      target_skills: ['Serve Accuracy', 'Consistency', 'Mental Focus'],
      created_by: adminUserId,
    },
    {
      slug: 'tennis-backhand-slice',
      title: 'Backhand Slice Technique',
      sport_id: await getSportId('tennis'),
      difficulty: 'advanced',
      duration_minutes: 35,
      equipment: ['Tennis racket', 'Tennis balls', 'Tennis court'],
      description: 'Master the backhand slice for better court positioning and defensive play.',
      steps: [
        'Start with shadow swings to practice the motion',
        'Use a continental grip for the slice',
        'Practice the high-to-low swing path',
        'Hit 20 balls focusing on contact point',
        'Work on slice depth and placement',
        'Practice slice approach shots',
      ],
      video_url: '/tennis-backhand-slice-demo.mp4',
      thumbnail_url: '/tennis-backhand-slice-drill.png',
      coaching_cues: [
        'Keep your wrist firm through contact',
        'Brush down the back of the ball',
        'Follow through across your body',
        'Stay low and balanced',
      ],
      safety_tips: [
        'Warm up with light rallying first',
        'Wear proper tennis shoes',
        'Stay hydrated in hot weather',
      ],
      target_skills: ['Backhand Technique', 'Ball Control', 'Court Positioning'],
      created_by: adminUserId,
    },
  ]

  const { error } = await supabase.from('drills').upsert(drills, { onConflict: 'slug' })
  if (error) {
    throw new Error(`Failed to upsert drills: ${error.message}`)
  }
}

async function seedAchievements(adminUserId) {
  const achievements = [
    {
      slug: 'first-goal',
      name: 'First Goal!',
      description: 'Completed your first training session',
      icon: 'Target',
      type: 'badge',
      sport_id: null,
      points: 100,
      created_by: adminUserId,
    },
    {
      slug: 'week-warrior',
      name: 'Week Warrior',
      description: 'Trained for 7 consecutive days',
      icon: 'Calendar',
      type: 'milestone',
      sport_id: null,
      points: 250,
      created_by: adminUserId,
    },
    {
      slug: 'multi-sport-master',
      name: 'Multi-Sport Master',
      description: 'Practiced 3 different sports',
      icon: 'Trophy',
      type: 'badge',
      sport_id: null,
      points: 300,
      created_by: adminUserId,
    },
    {
      slug: 'century-club',
      name: 'Century Club',
      description: 'Completed 100 training sessions',
      icon: 'Award',
      type: 'milestone',
      sport_id: null,
      points: 500,
      created_by: adminUserId,
    },
  ]

  const { error } = await supabase.from('achievements').upsert(achievements, { onConflict: 'slug' })
  if (error) {
    throw new Error(`Failed to upsert achievements: ${error.message}`)
  }
}

async function seedDailyChallenge(adminUserId) {
  const start = new Date()
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

  const challenge = {
    slug: 'first-touch-friday',
    title: 'First Touch Friday',
    description: 'Practice your first touch control with both feet. Complete 20 successful touches in a row!',
    sport_id: await getSportId('soccer'),
    difficulty: 'medium',
    points: 50,
    thumbnail_url: '/soccer-ball-control-challenge.png',
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    status: 'active',
    created_by: adminUserId,
  }

  const { error } = await supabase.from('daily_challenges').upsert(challenge, { onConflict: 'slug' })
  if (error) {
    throw new Error(`Failed to upsert daily challenge: ${error.message}`)
  }
}

async function seedTeamSessions(adminUserId) {
  const sessions = [
    {
      group_code: 'SOCCER24',
      title: 'Soccer Skills Training',
      description: 'Focused technical session covering first touch, dribbling, and shooting.',
      sport_id: await getSportId('soccer'),
      location: 'Field A - Lincoln High',
      start_time: new Date('2024-01-08T16:00:00.000Z').toISOString(),
      duration_minutes: 90,
      created_by: adminUserId,
      max_participants: 16,
      status: 'upcoming',
    },
    {
      group_code: 'BBALL09',
      title: 'Basketball Fundamentals',
      description: 'Team scrimmage and fundamentals tune-up.',
      sport_id: await getSportId('basketball'),
      location: 'Gym 1 - Roosevelt High',
      start_time: new Date('2024-01-09T15:30:00.000Z').toISOString(),
      duration_minutes: 75,
      created_by: adminUserId,
      max_participants: 12,
      status: 'active',
    },
    {
      group_code: 'VBALL07',
      title: 'Volleyball Serve Practice',
      description: 'Serve accuracy and defensive transitions.',
      sport_id: await getSportId('volleyball'),
      location: 'Gym 2 - Central High',
      start_time: new Date('2024-01-07T17:00:00.000Z').toISOString(),
      duration_minutes: 80,
      created_by: adminUserId,
      max_participants: 14,
      status: 'completed',
    },
  ]

  const { error } = await supabase.from('team_sessions').upsert(sessions, { onConflict: 'group_code' })
  if (error) {
    throw new Error(`Failed to upsert team sessions: ${error.message}`)
  }

  const { data, error: fetchError } = await supabase
    .from('team_sessions')
    .select('id, group_code')
    .in('group_code', sessions.map((s) => s.group_code))

  if (fetchError) {
    throw new Error(`Failed to fetch team sessions: ${fetchError.message}`)
  }

  const codeToId = new Map(data?.map((row) => [row.group_code, row.id]))

  const drillMap = new Map([
    ['soccer-first-touch-control', await getDrillId('soccer-first-touch-control')],
    ['soccer-cone-weaving', await getDrillId('soccer-cone-weaving')],
    ['basketball-free-throw', await getDrillId('basketball-free-throw')],
    ['basketball-vertical-jump', await getDrillId('basketball-vertical-jump')],
    ['volleyball-serve-accuracy', await getDrillId('volleyball-serve-accuracy')],
    ['tennis-backhand-slice', await getDrillId('tennis-backhand-slice')],
  ])

  const assignments = [
    { group_code: 'SOCCER24', drill_slug: 'soccer-first-touch-control', position: 1 },
    { group_code: 'SOCCER24', drill_slug: 'soccer-cone-weaving', position: 2 },
    { group_code: 'SOCCER24', drill_slug: 'basketball-free-throw', position: 3 },
    { group_code: 'BBALL09', drill_slug: 'basketball-free-throw', position: 1 },
    { group_code: 'BBALL09', drill_slug: 'basketball-vertical-jump', position: 2 },
    { group_code: 'BBALL09', drill_slug: 'soccer-cone-weaving', position: 3 },
    { group_code: 'VBALL07', drill_slug: 'volleyball-serve-accuracy', position: 1 },
    { group_code: 'VBALL07', drill_slug: 'tennis-backhand-slice', position: 2 },
  ]
    .map(({ group_code, drill_slug, position }) => ({
      session_id: codeToId.get(group_code),
      drill_id: drillMap.get(drill_slug),
      position,
    }))
    .filter((item) => item.session_id && item.drill_id)

  if (assignments.length) {
    const { error: assignmentError } = await supabase
      .from('team_session_drills')
      .upsert(assignments, { onConflict: 'session_id,drill_id' })

    if (assignmentError) {
      throw new Error(`Failed to upsert team session drills: ${assignmentError.message}`)
    }
  }
}

async function ensureSports() {
  const sports = [
    { slug: "basketball", name: "Basketball" },
    { slug: "soccer", name: "Soccer" },
    { slug: "tennis", name: "Tennis" },
    { slug: "volleyball", name: "Volleyball" },
    { slug: "running", name: "Running" },
    { slug: "cricket", name: "Cricket" },
  ]

  const { error } = await supabase.from("sports").upsert(sports, { onConflict: "slug" })
  if (error) {
    throw new Error(`Failed to upsert sports: ${error.message}`)
  }
}

async function run() {

  try {
    await ensureSports()
    const adminUserId = await resolveAdminUserId()
    await ensureProfile(adminUserId)
    await seedDrills(adminUserId)
    await seedAchievements(adminUserId)
    await seedDailyChallenge(adminUserId)
    await seedTeamSessions(adminUserId)
    console.log('Seed data applied successfully.')
  } catch (error) {
    console.error('Seed failed:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}

run()






