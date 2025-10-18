'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Sparkles, Target, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import type { Database } from '@/types/database'
import { getSupabaseBrowserClient, type SupabaseBrowserClient } from '@/lib/supabase-browser'
import { cn } from '@/lib/utils'

const MAX_USERNAME_LENGTH = 24
const MAX_USERNAME_ATTEMPTS = 5

const sanitizeUsernameBase = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const buildUsernameCandidate = (base: string, attempt: number): string | null => {
  if (!base) {
    return null
  }

  if (attempt === 0) {
    return base.slice(0, MAX_USERNAME_LENGTH)
  }

  const suffix = `-${attempt + 1}`
  const maxBaseLength = Math.max(1, MAX_USERNAME_LENGTH - suffix.length)
  const trimmedBase = base.slice(0, maxBaseLength).replace(/(^-|-$)/g, '')
  const candidate = `${trimmedBase}${suffix}`.replace(/(^-|-$)/g, '')

  if (!candidate) {
    return null
  }

  return candidate.slice(0, MAX_USERNAME_LENGTH)
}

const isUniqueConstraintError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return false
  }

  const { code } = error as { code?: string }
  return code === '23505'
}

const defaultSports = [
  { slug: 'basketball', name: 'Basketball', summary: 'Ball handling, shooting and footwork drills.' },
  { slug: 'soccer', name: 'Soccer', summary: 'First touch, agility and small sided training.' },
  { slug: 'tennis', name: 'Tennis', summary: 'Serve consistency, movement and recovery.' },
  { slug: 'running', name: 'Running', summary: 'Base mileage, intervals and pacing skills.' },
  { slug: 'cricket', name: 'Cricket', summary: 'Batting tempo, bowling control and fielding reps.' },
  { slug: 'rugby', name: 'Rugby', summary: 'Contact prep, rucking rhythm and tactical kicking.' },
  { slug: 'baseball', name: 'Baseball', summary: 'Hitting mechanics, pitching control and defensive reads.' },
  { slug: 'lacrosse', name: 'Lax', summary: 'Stick skills, dodges and ride/clear decision making.' },
  { slug: 'american-football', name: 'American Footy', summary: 'Route timing, tackling angles and playbook installs.' },
] as const

const skillLevels = [
  { id: 'starter', label: 'Starter', description: 'Learning the basics or returning after time away.' },
  { id: 'intermediate', label: 'Intermediate', description: 'Comfortable with fundamentals and building consistency.' },
  { id: 'advanced', label: 'Advanced', description: 'Competing regularly and chasing peak performance.' },
] as const

const genderOptions = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'non-binary', label: 'Non-binary' },
  { id: 'prefer-not', label: 'Prefer not to say' },
] as const

type GoalDefinition = {
  id: string
  label: string
  description?: string
}

const generalGoals: GoalDefinition[] = [
  { id: 'endurance', label: 'Build endurance' },
  { id: 'strength', label: 'Increase strength' },
  { id: 'speed', label: 'Get faster and more explosive' },
  { id: 'technique', label: 'Clean up technique' },
  { id: 'consistency', label: 'Stay consistent every week' },
]

const sportSpecificGoals: Record<string, GoalDefinition[]> = {
  basketball: [
    { id: 'handles', label: 'Handle tight defense' },
    { id: 'shooting', label: 'Hit catch-and-shoot looks' },
    { id: 'conditioning', label: 'Finish games with energy' },
    { id: 'defense', label: 'Lock down the perimeter' },
  ],
  soccer: [
    { id: 'first-touch', label: 'Clean first touch under pressure' },
    { id: 'finishing', label: 'Convert inside the box' },
    { id: 'stamina', label: 'Own the midfield late' },
    { id: 'defending', label: 'Win one-on-ones consistently' },
  ],
  tennis: [
    { id: 'serve', label: 'Dial in first-serve percentage' },
    { id: 'footwork', label: 'Stay balanced off the baseline' },
    { id: 'return', label: 'Attack second serves' },
    { id: 'mental', label: 'Close out long rallies' },
  ],
  running: [
    { id: 'base', label: 'Build aerobic base miles' },
    { id: 'speedwork', label: 'Sharpen interval splits' },
    { id: 'strength', label: 'Stay strong late in races' },
    { id: 'mobility', label: 'Recover with mobility work' },
  ],
  cricket: [
    { id: 'batting-tempo', label: 'Control innings tempo' },
    { id: 'bowling-control', label: 'Land a consistent line' },
    { id: 'fielding', label: 'Clean up ground fielding' },
    { id: 'fitness', label: 'Stay sharp between overs' },
  ],
  rugby: [
    { id: 'contact', label: 'Win collision moments' },
    { id: 'rucking', label: 'Secure quick rucks' },
    { id: 'kicking', label: 'Pin opponents deep' },
    { id: 'defense', label: 'Hold the gain line' },
  ],
  baseball: [
    { id: 'hitting', label: 'Square up contact more often' },
    { id: 'pitching', label: 'Command the strike zone' },
    { id: 'fielding', label: 'Clean transitions across the diamond' },
    { id: 'base-running', label: 'Steal and score efficiently' },
  ],
  lacrosse: [
    { id: 'stick-work', label: 'Tighten stick skills under pressure' },
    { id: 'dodging', label: 'Beat your matchup off the dodge' },
    { id: 'shooting', label: 'Finish off-ball chances' },
    { id: 'ride-clear', label: 'Win ride and clear possessions' },
  ],
  'american-football': [
    { id: 'routes', label: 'Sharpen route timing' },
    { id: 'tackling', label: 'Finish open field tackles' },
    { id: 'reads', label: 'Progress through reads faster' },
    { id: 'conditioning', label: 'Sustain fourth-quarter bursts' },
  ],
}

const sportAccents: Record<
  string,
  {
    bar: string
    card: string
    badge: string
    glow: string
  }
> = {
  basketball: {
    bar: 'from-orange-500 via-amber-400 to-orange-500',
    card: 'border border-white/5 bg-gradient-to-br from-orange-500/14 via-orange-500/7 to-transparent shadow-[0_34px_100px_-80px_rgba(249,115,22,0.45)] ring-1 ring-orange-400/25',
    badge: 'bg-orange-500/15 text-orange-600',
    glow: 'from-orange-500/45 via-amber-400/15 to-orange-500/45',
  },
  soccer: {
    bar: 'from-emerald-500 via-lime-400 to-emerald-500',
    card: 'border border-white/5 bg-gradient-to-br from-emerald-500/14 via-lime-400/7 to-transparent shadow-[0_34px_100px_-80px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400/25',
    badge: 'bg-emerald-500/15 text-emerald-600',
    glow: 'from-emerald-500/45 via-lime-400/18 to-emerald-500/45',
  },
  tennis: {
    bar: 'from-yellow-500 via-lime-400 to-emerald-400',
    card: 'border border-white/5 bg-gradient-to-br from-yellow-400/14 via-lime-400/7 to-transparent shadow-[0_34px_100px_-80px_rgba(234,179,8,0.38)] ring-1 ring-yellow-400/25',
    badge: 'bg-yellow-500/15 text-yellow-600',
    glow: 'from-yellow-400/42 via-lime-400/18 to-emerald-400/40',
  },
  running: {
    bar: 'from-sky-500 via-blue-400 to-sky-500',
    card: 'border border-white/5 bg-gradient-to-br from-sky-500/14 via-blue-400/7 to-transparent shadow-[0_34px_100px_-80px_rgba(56,189,248,0.42)] ring-1 ring-sky-400/25',
    badge: 'bg-sky-500/15 text-sky-600',
    glow: 'from-sky-500/45 via-blue-400/18 to-cyan-400/40',
  },
  cricket: {
    bar: 'from-rose-500 via-red-400 to-rose-500',
    card: 'border border-white/5 bg-gradient-to-br from-rose-500/14 via-red-400/7 to-transparent shadow-[0_34px_100px_-80px_rgba(244,63,94,0.46)] ring-1 ring-rose-400/25',
    badge: 'bg-rose-500/15 text-rose-600',
    glow: 'from-rose-500/48 via-red-400/18 to-pink-500/40',
  },
  rugby: {
    bar: 'from-lime-500 via-emerald-400 to-lime-500',
    card: 'border border-white/5 bg-gradient-to-br from-lime-500/14 via-emerald-400/7 to-transparent shadow-[0_34px_100px_-80px_rgba(132,204,22,0.4)] ring-1 ring-lime-400/25',
    badge: 'bg-lime-500/15 text-lime-600',
    glow: 'from-lime-500/42 via-emerald-400/18 to-lime-400/40',
  },
  baseball: {
    bar: 'from-cyan-500 via-sky-400 to-cyan-500',
    card: 'border border-white/5 bg-gradient-to-br from-cyan-500/14 via-sky-400/7 to-transparent shadow-[0_34px_100px_-80px_rgba(6,182,212,0.42)] ring-1 ring-cyan-400/25',
    badge: 'bg-cyan-500/15 text-cyan-600',
    glow: 'from-cyan-500/45 via-sky-400/18 to-blue-400/40',
  },
  lacrosse: {
    bar: 'from-purple-500 via-indigo-400 to-purple-500',
    card: 'border border-white/5 bg-gradient-to-br from-purple-500/14 via-indigo-400/7 to-transparent shadow-[0_34px_100px_-80px_rgba(168,85,247,0.46)] ring-1 ring-purple-400/25',
    badge: 'bg-purple-500/15 text-purple-600',
    glow: 'from-purple-500/45 via-indigo-400/18 to-fuchsia-500/40',
  },
  'american-football': {
    bar: 'from-amber-600 via-orange-500 to-amber-600',
    card: 'border border-white/5 bg-gradient-to-br from-amber-600/14 via-orange-500/7 to-transparent shadow-[0_34px_100px_-80px_rgba(217,119,6,0.48)] ring-1 ring-amber-500/25',
    badge: 'bg-amber-500/15 text-amber-600',
    glow: 'from-amber-600/45 via-orange-500/18 to-red-500/35',
  },
}

const privacyOptions = [
  { id: 'public', label: 'Public', description: 'Anyone on the platform can see my clips.' },
  { id: 'followers', label: 'Followers', description: 'Only followers can watch my clips.' },
  { id: 'private', label: 'Private', description: 'Only I can see my clips until I change this later.' },
] as const

const steps = ['sports', 'profile', 'goals'] as const
type Step = typeof steps[number]

const stepMeta: Record<
  Step,
  {
    label: string
    icon: LucideIcon
    tagline: string
    description: string
  }
> = {
  sports: {
    label: 'Sports',
    icon: Sparkles,
    tagline: 'Pick your disciplines',
    description:
      'Select the sports that define your season so daily challenges, leaderboards, and highlights bend around them.',
  },
  profile: {
    label: 'Profile',
    icon: User,
    tagline: 'Dial in the basics',
    description:
      'Share who you rep and where you train so team invites, streaks, and workload insights sync with your real world.',
  },
  goals: {
    label: 'Goals',
    icon: Target,
    tagline: 'Lock your focus',
    description:
      'Tell us the first arcs we should push and commit to the safe recording pledge to unlock clip sharing.',
  },
}

const wizardShellClass =
  'relative isolate overflow-hidden !gap-0 rounded-[28px] border border-white/12 bg-background/82 !py-10 shadow-[0_55px_140px_-100px_rgba(15,23,42,0.5)] backdrop-blur-xl transition-[box-shadow,transform] duration-500 hover:translate-y-[-1px] hover:shadow-[0_75px_180px_-110px_rgba(37,99,235,0.45)]'

const fieldShellClass =
  'group relative rounded-2xl border border-white/14 bg-white/6 p-5 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] transition-all duration-300 focus-within:border-white/25 focus-within:bg-white/10 focus-within:shadow-[0_55px_130px_-80px_rgba(37,99,235,0.45)]'

interface SportOption {
  id: number
  slug: string
  name: string
  summary: string
}

type SportRow = Pick<Database['public']['Tables']['sports']['Row'], 'id' | 'slug' | 'name'>

type ProfilesInsert = Database['public']['Tables']['profiles']['Insert']

type ProfilesClient = {
  from(table: 'profiles'): {
    upsert(values: ProfilesInsert): Promise<{ error: unknown }>
  }
}

type UserSportsInsert = Database['public']['Tables']['user_sports']['Insert']

type UserSportsClient = {
  from(table: 'user_sports'): {
    insert(values: UserSportsInsert[]): Promise<{ error: unknown }>
  }
}

export default function OnboardingPage() {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = useMemo<SupabaseBrowserClient>(() => getSupabaseBrowserClient(), [])
  const { session, refreshProfile } = useAuth()

  const [sports, setSports] = useState<SportOption[]>([])
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [sportIdMap, setSportIdMap] = useState<Record<string, number>>({})

  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [gender, setGender] = useState('')
  const [skillLevel, setSkillLevel] = useState<string>('starter')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public')

  const [stepIndex, setStepIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const currentStep: Step = steps[stepIndex]
  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100)
  const currentMeta = stepMeta[currentStep]
  const canFinish = selectedGoals.length > 0 && hasAcceptedTerms

  const resolvedSports = useMemo<SportOption[]>(() => {
    if (sports.length) {
      return sports
    }

    return defaultSports.map((item, index) => ({
      id: index + 1,
      slug: item.slug,
      name: item.name,
      summary: item.summary,
    }))
  }, [sports])

  const slugToName = useMemo(() => {
    const map: Record<string, string> = {}
    resolvedSports.forEach((sport) => {
      map[sport.slug] = sport.name
    })
    return map
  }, [resolvedSports])

  const goalCatalog = useMemo(() => {
    type GoalSection = {
      sportSlug: string
      sportName: string
      items: Array<{ id: string; label: string; description?: string }>
    }

    const sections: GoalSection[] = []
    const selectionMap: Record<string, { label: string; sportName: string }> = {}
    const activeSlugs = selectedSports.length ? selectedSports : ['general']

    activeSlugs.forEach((slug) => {
      const prettyName = slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
      const sportName =
        slug === 'general'
          ? 'General Training'
          : slugToName[slug] ?? prettyName

      const baseGoals =
        slug === 'general'
          ? generalGoals
          : sportSpecificGoals[slug as keyof typeof sportSpecificGoals] ?? generalGoals

      const items = baseGoals.map((goal) => {
        const goalId = `${slug}:${goal.id}`
        selectionMap[goalId] = {
          label: `${sportName} - ${goal.label}`,
          sportName,
        }

        return {
          id: goalId,
          label: goal.label,
          description: goal.description,
        }
      })

      sections.push({
        sportSlug: slug,
        sportName,
        items,
      })
    })

    return { sections, selectionMap }
  }, [selectedSports, slugToName])

  useEffect(() => {
    setSelectedGoals((prev) => {
      const filtered = prev.filter((goalId) => goalCatalog.selectionMap[goalId])
      return filtered.length === prev.length ? prev : filtered
    })
  }, [goalCatalog])

  useEffect(() => {
    let active = true

    const loadSports = async () => {
      const { data, error } = await supabase.from('sports').select('id, slug, name').order('name')

      if (!active) return

      if (error || !data?.length) {
        const fallbackMap: Record<string, number> = {}
        setSports(
          defaultSports.map((item, index) => ({
            id: index + 1,
            slug: item.slug,
            name: item.name,
            summary: item.summary,
          }))
        )
        setSportIdMap(fallbackMap)
        if (error) {
          toast({
            title: 'Could not load sports list',
            description: error.message,
            variant: 'destructive',
          })
        }
        return
      }

      const rows = data as SportRow[]
      const map: Record<string, number> = {}
      const options: SportOption[] = rows.map((row) => {
        map[row.slug] = row.id
        const fallback = defaultSports.find((item) => item.slug === row.slug)
        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          summary: fallback?.summary ?? 'Training and progress tracking for this sport.',
        }
      })

      setSports(options)
      setSportIdMap(map)
    }

    loadSports().catch(() => {
      if (active) {
        setSports(
          defaultSports.map((item, index) => ({
            id: index + 1,
            slug: item.slug,
            name: item.name,
            summary: item.summary,
          }))
        )
        setSportIdMap({})
      }
    })

    return () => {
      active = false
    }
  }, [supabase, toast])

  const toggleSport = (slug: string) => {
    setSelectedSports((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    )
  }

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const canContinue = () => {
    switch (currentStep) {
      case 'sports':
        return selectedSports.length > 0
      case 'profile':
        return Boolean(displayName.trim() && location.trim() && gender)
      case 'goals':
        return canFinish
      default:
        return false
    }
  }

  const goNext = () => {
    if (stepIndex < steps.length - 1 && canContinue()) {
      setStepIndex((value) => value + 1)
    }
  }

  const goPrevious = () => {
    if (stepIndex > 0) {
      setStepIndex((value) => value - 1)
    }
  }

  const handleStepSelect = (index: number) => {
    if (index === stepIndex) {
      return
    }

    if (index < stepIndex) {
      setStepIndex(index)
      return
    }

    if (index === stepIndex + 1 && canContinue()) {
      setStepIndex(index)
    }
  }

  const handleFinish = async () => {
    const redirectToDashboard = () => {
      router.push('/dashboard')
      router.refresh()
    }

    if (!session?.user) {
      redirectToDashboard()
      return
    }

    setIsSaving(true)
    try {
      const fallbackName = session.user.user_metadata?.full_name || session.user.email || 'Athlete'
      const finalName = displayName.trim() || fallbackName
      const usernameBase = sanitizeUsernameBase(finalName)

      const profileBioParts = [] as string[]
      if (affiliation.trim()) profileBioParts.push(`Team: ${affiliation.trim()}`)
      profileBioParts.push(`Privacy: ${privacy}`)
      const genderLabel = genderOptions.find((option) => option.id === gender)?.label
      if (genderLabel) {
        profileBioParts.push(`Gender: ${genderLabel}`)
      }
      profileBioParts.push('Safe recording pledge: accepted')

      // Supabase type defs misalign with Next.js 15 route builds; manually narrow profiles client.
      const profilesClient = supabase as unknown as ProfilesClient
      const profilePayload: ProfilesInsert = {
        id: session.user.id,
        display_name: finalName,
        location: location.trim() || null,
        bio: profileBioParts.join(' | ') || null,
      }

      if (!usernameBase) {
        const { error: profileError } = await profilesClient
          .from('profiles')
          .upsert({
            ...profilePayload,
            username: null,
          })

        if (profileError) {
          throw profileError
        }
      } else {
        let profileSaved = false

        for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt += 1) {
          const usernameCandidate = buildUsernameCandidate(usernameBase, attempt)
          const { error: profileError } = await profilesClient
            .from('profiles')
            .upsert({
              ...profilePayload,
              username: usernameCandidate,
            })

          if (!profileError) {
            profileSaved = true
            break
          }

          if (!isUniqueConstraintError(profileError)) {
            throw profileError
          }
        }

        if (!profileSaved) {
          const { error: profileError } = await profilesClient
            .from('profiles')
            .upsert({
              ...profilePayload,
              username: null,
            })

          if (profileError) {
            throw profileError
          }
        }
      }

      const goalSummary =
        selectedGoals
          .map((goalId) => goalCatalog.selectionMap[goalId]?.label ?? goalId)
          .join(', ') || null

      const sportIds = selectedSports
        .map((slug) => sportIdMap[slug])
        .filter((value): value is number => typeof value === 'number')

      const { error: deleteError } = await supabase
        .from('user_sports')
        .delete()
        .eq('user_id', session.user.id)

      if (deleteError) {
        throw deleteError
      }

      if (sportIds.length) {
        const rows: UserSportsInsert[] = sportIds.map((id) => ({
          user_id: session.user.id,
          sport_id: id,
          skill_level: skillLevel,
          goals: goalSummary,
        }))

        const userSportsClient = supabase as unknown as UserSportsClient
        const { error: insertError } = await userSportsClient
          .from('user_sports')
          .insert(rows)
        if (insertError) {
          throw insertError
        }
      }

      await refreshProfile().catch(() => null)

      redirectToDashboard()
    } catch (error) {
      console.error('Failed to finish onboarding, redirecting to dashboard fallback.', error)
      toast({
        title: 'Taking you to the dashboard',
        description: 'Preview mode could not save your onboarding data yet, but you can explore the dashboard.',
      })
      redirectToDashboard()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className='relative min-h-screen overflow-hidden bg-background'>
        <span className='pointer-events-none absolute -top-24 -left-24 hidden h-[420px] w-[420px] rounded-full bg-gradient-to-br from-sport-blue/20 via-sport-green/10 to-transparent blur-[140px] sm:block' />
        <span className='pointer-events-none absolute bottom-[-28%] right-[-18%] h-[480px] w-[480px] rounded-full bg-gradient-to-br from-sport-orange/18 via-sport-blue/10 to-transparent blur-[150px]' />
        <span className='pointer-events-none absolute top-1/2 left-[80%] hidden h-72 w-72 -translate-y-1/2 rounded-full bg-gradient-to-br from-sport-green/14 via-transparent to-sport-orange/12 blur-[110px] md:block' />

        <div className='relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8'>
          <div className='relative isolate overflow-hidden rounded-[36px] border border-border/60 bg-background/85 p-6 shadow-[0_95px_220px_-130px_rgba(12,21,38,0.85)] backdrop-blur-2xl dark:border-white/10 sm:p-10'>
            <div className='pointer-events-none absolute inset-0 opacity-70'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--sport-blue)/0.22,transparent_65%)]' />
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,var(--sport-orange)/0.18,transparent_60%)]' />
            </div>

            <div className='relative flex flex-col gap-10'>
              <header className='flex flex-col items-center gap-4 text-center sm:items-start sm:text-left'>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1 text-[0.68rem] uppercase tracking-[0.35em] text-muted-foreground/75'>
                  <currentMeta.icon className='h-3.5 w-3.5 text-sport-green' />
                  Step {stepIndex + 1} of {steps.length}
                </span>
                <h1 className='text-3xl font-semibold sm:text-4xl md:text-5xl'>Dial in your multi-sport cockpit</h1>
                <p className='max-w-2xl text-sm text-muted-foreground/90 sm:text-base'>
                  AthletIQs uses these signals to align daily challenges, cross-sport workloads, and highlight moments with how you actually train.
                </p>
                <p className='max-w-2xl text-sm text-muted-foreground sm:text-base'>{currentMeta.description}</p>
              </header>

              <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-background/65 p-5 shadow-[0_45px_120px_-100px_rgba(37,99,235,0.35)] backdrop-blur-xl'>
                <span className='pointer-events-none absolute inset-0 bg-gradient-to-r from-sport-blue/18 via-sport-green/12 to-sport-orange/18 opacity-45 blur-xl' />
                <div className='relative flex flex-col gap-3 sm:flex-row sm:items-center'>
                  <div className='relative flex-1 overflow-hidden rounded-full bg-white/10'>
                    <span
                      className='absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sport-blue via-sport-green to-sport-orange transition-all duration-500'
                      style={{ width: `${progressPercent}%` }}
                    />
                    <span className='pointer-events-none absolute inset-0 rounded-full border border-white/12' />
                  </div>
                  <span className='text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground/70'>
                    {progressPercent}% synced
                  </span>
                </div>

                <div className='relative mt-4 grid gap-2 sm:grid-cols-3'>
                  {steps.map((step, index) => {
                    const meta = stepMeta[step]
                    const isActive = index === stepIndex
                    const isComplete = index < stepIndex
                    const isClickable = index <= stepIndex || (index === stepIndex + 1 && canContinue())

                    return (
                      <button
                        key={step}
                        type='button'
                        onClick={() => handleStepSelect(index)}
                        disabled={!isClickable}
                        className={cn(
                          'group relative flex h-full items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60',
                          isActive && 'border-white/20 bg-gradient-to-r from-sport-blue/18 via-sport-green/14 to-sport-orange/18 shadow-[0_45px_130px_-95px_rgba(37,99,235,0.5)]',
                          isComplete && !isActive && 'border-white/14 bg-background/62 text-foreground/85'
                        )}
                        aria-current={isActive}
                      >
                        <span className='relative flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/8'>
                          <meta.icon className={cn('h-4 w-4 transition-colors', isActive ? 'text-foreground' : 'text-muted-foreground/70')} />
                        </span>
                        <span className='flex flex-col leading-tight'>
                          <span className='text-[0.68rem] font-semibold uppercase tracking-[0.32em]'>{meta.label}</span>
                          <span className='text-xs text-muted-foreground/70'>{meta.tagline}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Tabs value={currentStep} className='w-full'>
                <TabsContent value='sports'>
                  <Card className={cn(wizardShellClass)}>
                    <div className='pointer-events-none absolute inset-0 opacity-70'>
                      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--sport-blue)/0.22,transparent_62%)]' />
                      <div className='absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,var(--sport-orange)/0.2,transparent_60%)]' />
                    </div>
                    <CardHeader className='relative z-10 space-y-4 px-10 pb-10'>
                      <CardTitle className='text-2xl font-semibold sm:text-3xl'>Select your sports</CardTitle>
                      <CardDescription className='max-w-2xl text-base text-muted-foreground sm:text-lg'>
                        Pick at least one sport to unlock curated drills, rival leaderboards, and hybrid training playlists.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='relative z-10 space-y-8 px-10 pb-12'>
                      <div className='grid gap-4 sm:grid-cols-2'>
                        {resolvedSports.map((sport) => {
                          const selected = selectedSports.includes(sport.slug)
                          const accent = sportAccents[sport.slug]
                          return (
                            <button
                              key={sport.slug}
                              type='button'
                              onClick={() => toggleSport(sport.slug)}
                              aria-pressed={selected}
                              className={cn(
                                'group relative isolate flex h-full flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-background/62 p-6 text-left shadow-[0_38px_120px_-100px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_58px_150px_-110px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                selected && 'text-foreground',
                                selected && accent?.card
                              )}
                            >
                              <span
                                aria-hidden='true'
                                className={cn(
                                  'pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r opacity-0 transition duration-300',
                                  accent?.bar,
                                  selected ? 'opacity-100' : 'group-hover:opacity-80'
                                )}
                              />
                              <span
                                aria-hidden='true'
                                className={cn(
                                  'pointer-events-none absolute -inset-24 -z-10 bg-gradient-to-br opacity-0 blur-3xl transition duration-500',
                                  accent?.glow,
                                  selected ? 'opacity-90' : 'group-hover:opacity-75'
                                )}
                              />
                              <span className='pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/10 transition duration-300 group-hover:border-white/16 group-aria-[pressed=true]:border-white/22' />
                              <div className='relative z-10 space-y-3'>
                                <h3 className='text-xl font-semibold tracking-tight'>{sport.name}</h3>
                                <p className='text-sm leading-relaxed text-muted-foreground/80'>{sport.summary}</p>
                              </div>
                              <div className='relative z-10 mt-auto flex items-center justify-between text-[0.68rem] font-medium uppercase tracking-[0.32em] text-muted-foreground/70'>
                                {selected ? (
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em]',
                                      accent?.badge ?? 'bg-primary/10 text-primary'
                                    )}
                                  >
                                    <Check className='h-3.5 w-3.5' />
                                    Added
                                  </span>
                                ) : (
                                  <span className='text-muted-foreground/75'>Tap to add</span>
                                )}
                                <span className='text-[0.58rem] uppercase tracking-[0.3em] text-muted-foreground/60'>Active</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      <div className='space-y-4 rounded-2xl border border-white/10 bg-background/62 p-6 shadow-[0_40px_140px_-110px_rgba(15,23,42,0.45)]'>
                        <p className='text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground/70'>Current skill level</p>
                        <RadioGroup value={skillLevel} onValueChange={setSkillLevel} className='mt-3 grid gap-3 sm:grid-cols-3'>
                          {skillLevels.map((level) => {
                            const selected = skillLevel === level.id
                            const inputId = `skill-${level.id}`
                            return (
                              <Label
                                key={level.id}
                                htmlFor={inputId}
                                className={cn(
                                  'group relative isolate flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-background/62 p-4 text-left shadow-[0_28px_110px_-95px_rgba(15,23,42,0.45)] transition-all duration-300 hover:border-white/18 hover:shadow-[0_58px_150px_-120px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                  selected && 'border-white/22 bg-gradient-to-br from-sport-blue/16 via-sport-green/10 to-transparent text-foreground shadow-[0_68px_160px_-120px_rgba(37,99,235,0.5)]'
                                )}
                              >
                                <RadioGroupItem id={inputId} value={level.id} className='sr-only' />
                                <div className='relative z-10 space-y-1'>
                                  <span className='text-sm font-semibold'>{level.label}</span>
                                  <span className='text-xs text-muted-foreground/75'>{level.description}</span>
                                </div>
                                {selected && (
                                  <span className='relative z-10 inline-flex items-center gap-1 text-xs font-semibold text-sport-blue'>
                                    <Check className='h-3 w-3' />
                                    Selected
                                  </span>
                                )}
                              </Label>
                            )
                          })}
                        </RadioGroup>
                      </div>

                      <div className='rounded-2xl border border-dashed border-white/20 bg-background/55 p-5 text-sm text-muted-foreground/80 shadow-[0_70px_190px_-130px_rgba(15,23,42,0.6)]'>
                        Pro tip: add at least two sports to unlock hybrid challenges and crossover leaderboards right away.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>


            <TabsContent value='profile'>
              <Card className={cn(wizardShellClass)}>
                <div className='pointer-events-none absolute inset-0 opacity-70'>
                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--sport-green)/0.2,transparent_60%)]' />
                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--sport-blue)/0.18,transparent_60%)]' />
                </div>
                <CardHeader className='relative z-10 space-y-4 px-10 pb-10'>
                  <CardTitle className='text-2xl font-semibold sm:text-3xl'>Profile details</CardTitle>
                  <CardDescription className='max-w-2xl text-base text-muted-foreground sm:text-lg'>
                    Fill out the essentials so teammates and clubs can recognise you instantly.
                  </CardDescription>
                </CardHeader>
                <CardContent className='relative z-10 space-y-8 px-10 pb-12'>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className={fieldShellClass}>
                      <Label htmlFor='displayName' className='text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground/70'>Display name</Label>
                      <Input
                        id='displayName'
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder='Jordan Taylor'
                        required
                        autoComplete='name'
                        className='mt-3 h-11 rounded-xl border border-white/25 bg-white/[0.12] px-4 text-base font-semibold text-foreground placeholder:text-muted-foreground/55 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] focus-visible:border-white/35 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0'
                      />
                    </div>
                    <div className={fieldShellClass}>
                      <Label htmlFor='location' className='text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground/70'>Location</Label>
                      <Input
                        id='location'
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder='Austin, TX'
                        required
                        autoComplete='address-level2'
                        className='mt-3 h-11 rounded-xl border border-white/25 bg-white/[0.12] px-4 text-base font-semibold text-foreground placeholder:text-muted-foreground/55 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] focus-visible:border-white/35 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0'
                      />
                    </div>
                  </div>

                  <div className='space-y-4 rounded-2xl border border-white/12 bg-background/70 p-6 shadow-[0_70px_190px_-130px_rgba(15,23,42,0.6)]'>
                    <p className='text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground/70'>Gender</p>
                    <RadioGroup value={gender} onValueChange={setGender} className='mt-3 grid gap-3 sm:grid-cols-2'>
                      {genderOptions.map((option) => {
                        const selected = gender === option.id
                        const inputId = `gender-${option.id}`
                        return (
                          <Label
                            key={option.id}
                            htmlFor={inputId}
                            className={cn(
                              'group relative isolate flex cursor-pointer items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-background/60 p-4 text-sm font-semibold shadow-[0_32px_120px_-110px_rgba(15,23,42,0.45)] transition-all duration-300 hover:border-white/18 hover:shadow-[0_62px_160px_-120px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                              selected && 'border-white/22 bg-gradient-to-r from-sport-green/18 via-sport-blue/10 to-transparent text-foreground shadow-[0_78px_170px_-130px_rgba(37,99,235,0.5)]'
                            )}
                          >
                            <RadioGroupItem id={inputId} value={option.id} className='sr-only' />
                            <span className='relative z-10'>{option.label}</span>
                            {selected && (
                              <span className='relative z-10 inline-flex items-center gap-1 text-xs font-semibold text-sport-green'>
                                <Check className='h-3 w-3' />
                                Selected
                              </span>
                            )}
                          </Label>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className={fieldShellClass}>
                      <Label htmlFor='affiliation' className='text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground/70'>Team or club</Label>
                      <Input
                        id='affiliation'
                        value={affiliation}
                        onChange={(event) => setAffiliation(event.target.value)}
                        placeholder='River City United'
                        className='mt-2 h-auto border-none bg-transparent px-0 text-base font-semibold text-foreground placeholder:text-muted-foreground/40 focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0'
                      />
                    </div>
                  <div className='rounded-2xl border border-dashed border-white/14 bg-background/58 p-4 text-xs text-muted-foreground/75 shadow-[0_35px_130px_-110px_rgba(15,23,42,0.4)]'>
                      Optional: drop your squad so coaches can tag you into the right leaderboards.
                    </div>
                  </div>

                  <div className='space-y-4 rounded-2xl border border-white/10 bg-background/62 p-6 shadow-[0_42px_140px_-120px_rgba(15,23,42,0.45)]'>
                    <p className='text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground/70'>Account privacy</p>
                    <RadioGroup value={privacy} onValueChange={(value) => setPrivacy(value as typeof privacy)} className='mt-3 grid gap-3 sm:grid-cols-3'>
                      {privacyOptions.map((option) => {
                        const selected = privacy === option.id
                        return (
                          <Label
                            key={option.id}
                          className={cn(
                            'group relative isolate flex cursor-pointer flex-col gap-2 overflow-hidden rounded-2xl border border-white/10 bg-background/60 p-4 text-left shadow-[0_32px_120px_-110px_rgba(15,23,42,0.45)] transition-all duration-300 hover:border-white/18 hover:shadow-[0_62px_170px_-130px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            selected && 'border-white/22 bg-gradient-to-br from-sport-blue/16 via-sport-green/10 to-transparent text-foreground shadow-[0_78px_180px_-140px_rgba(37,99,235,0.5)]'
                            )}
                          >
                            <RadioGroupItem value={option.id} className='sr-only' />
                            <span className='text-sm font-semibold'>{option.label}</span>
                            <span className='text-xs text-muted-foreground/75'>{option.description}</span>
                            {selected && (
                              <span className='inline-flex items-center gap-1 text-xs font-semibold text-sport-blue'>
                                <Check className='h-3 w-3' />
                                Selected
                              </span>
                            )}
                          </Label>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  <p className='text-xs text-muted-foreground/70'>These details only take a moment, and you can tweak everything later in Settings &gt; Profile.</p>
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value='goals'>
              <Card className={cn(wizardShellClass)}>
                <div className='pointer-events-none absolute inset-0 opacity-70'>
                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--sport-orange)/0.22,transparent_60%)]' />
                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,var(--sport-blue)/0.18,transparent_60%)]' />
                </div>
                <CardHeader className='relative z-10 space-y-4 px-10 pb-10'>
                  <CardTitle className='text-2xl font-semibold sm:text-3xl'>Training focus</CardTitle>
                  <CardDescription className='max-w-2xl text-base text-muted-foreground sm:text-lg'>
                    Select the areas you want to work on first. You can remix them anytime.
                  </CardDescription>
                </CardHeader>
                <CardContent className='relative z-10 space-y-8 px-10 pb-12'>
                  <div className='space-y-6'>
                    {goalCatalog.sections.map((section) => (
                      <div key={section.sportSlug} className='space-y-3'>
                        <p className='text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground/70'>{section.sportName}</p>
                        <div className='grid gap-3 sm:grid-cols-2'>
                          {section.items.map((goal) => {
                            const checked = selectedGoals.includes(goal.id)
                            const checkboxId = `goal-${goal.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
                            return (
                              <Label
                                key={goal.id}
                                htmlFor={checkboxId}
                                className={cn(
                                  'group relative isolate flex cursor-pointer items-start gap-3 overflow-hidden rounded-2xl border border-white/10 bg-background/60 p-4 text-left shadow-[0_30px_120px_-115px_rgba(15,23,42,0.45)] transition-all duration-300 hover:border-white/18 hover:shadow-[0_60px_170px_-130px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                  checked && 'border-white/22 bg-gradient-to-br from-sport-orange/16 via-sport-blue/10 to-transparent text-foreground shadow-[0_75px_200px_-150px_rgba(37,99,235,0.5)]'
                                )}
                              >
                                <Checkbox
                                  id={checkboxId}
                                  checked={checked}
                                  onCheckedChange={() => toggleGoal(goal.id)}
                                  className='mt-1 size-5 rounded-md border-white/25 bg-transparent data-[state=checked]:bg-sport-orange data-[state=checked]:text-white focus-visible:ring-white/30'
                                />
                                <span className='relative z-10 space-y-1'>
                                  <span className='text-sm font-semibold'>{goal.label}</span>
                                  {goal.description && <span className='text-xs text-muted-foreground/75'>{goal.description}</span>}
                                </span>
                              </Label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='rounded-2xl border border-dashed border-white/16 bg-background/58 p-5 text-sm text-muted-foreground/80 shadow-[0_45px_150px_-130px_rgba(15,23,42,0.45)]'>
                    Tip: updating your goals keeps the streak tracker honest and makes new clip recommendations sharper.
                  </div>

                  <div className='rounded-2xl border border-white/10 bg-background/60 p-6 shadow-[0_50px_170px_-140px_rgba(15,23,42,0.45)]'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5'>
                      <Checkbox
                        id='safe-recording'
                        checked={hasAcceptedTerms}
                        onCheckedChange={(value) => setHasAcceptedTerms(value === true)}
                        className='mt-1 size-5 rounded-md border-white/25 bg-transparent data-[state=checked]:bg-sport-blue data-[state=checked]:text-white focus-visible:ring-white/30'
                      />
                      <div className='space-y-2 text-sm'>
                        <Label htmlFor='safe-recording' className='cursor-pointer text-base font-semibold tracking-tight text-foreground'>
                          Safe recording pledge
                        </Label>
                        <p className='text-xs text-muted-foreground/75'>
                          I will not film minors or teammates without explicit permission, and I&apos;ll respect facility policies about recording.
                        </p>
                        <p className='text-xs text-muted-foreground/75'>I understand that breaking this trust can remove my access to posting clips.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

          <div className='relative mt-10 flex flex-col gap-4 rounded-2xl border border-white/10 bg-background/65 p-4 shadow-[0_55px_170px_-140px_rgba(15,23,42,0.45)] sm:flex-row sm:items-center sm:justify-between'>
            <Button
              variant='outline'
              onClick={goPrevious}
              disabled={stepIndex === 0}
              className='w-full sm:w-auto border-white/18 bg-white/8 px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:border-white/24 hover:bg-white/12 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-muted-foreground/60'
            >
              Back
            </Button>

            <div className='flex-1 text-center text-xs text-muted-foreground/75 sm:px-6 sm:text-left'>
              {currentStep === 'sports' && 'Choose at least one sport and a skill tier to continue.'}
              {currentStep === 'profile' && 'Share your basics so invites, leaderboards, and squads know where to look.'}
              {currentStep === 'goals' && 'Select at least one focus lane and accept the pledge to wrap onboarding.'}
            </div>

            {stepIndex === steps.length - 1 ? (
              <Button
                onClick={handleFinish}
                disabled={isSaving || !canFinish}
                className='w-full sm:w-auto rounded-full bg-gradient-to-r from-sport-blue via-sport-green to-sport-orange px-8 py-3 text-sm font-semibold text-white shadow-[0_45px_140px_-110px_rgba(37,99,235,0.5)] transition hover:shadow-[0_60px_170px_-120px_rgba(37,99,235,0.6)] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSaving ? 'Saving...' : 'Finish onboarding'}
              </Button>
            ) : (
              <Button
                onClick={goNext}
                disabled={!canContinue()}
                className='w-full sm:w-auto rounded-full bg-gradient-to-r from-sport-blue via-sport-green to-sport-orange px-8 py-3 text-sm font-semibold text-white shadow-[0_45px_140px_-110px_rgba(37,99,235,0.5)] transition hover:shadow-[0_60px_170px_-120px_rgba(37,99,235,0.6)] disabled:cursor-not-allowed disabled:opacity-60'
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
    </AuthGuard>
  )
}
