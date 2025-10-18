'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import type { Database } from '@/types/database'
import { getSupabaseBrowserClient, type SupabaseBrowserClient } from '@/lib/supabase-browser'
import { cn } from '@/lib/utils'

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
] as const

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
} as const

const sportAccents: Record<
  string,
  {
    bar: string
    card: string
    badge: string
  }
> = {
  basketball: {
    bar: 'from-orange-500 via-amber-400 to-orange-500',
    card: 'border-orange-500/80 bg-orange-500/5 shadow-[0_18px_40px_-18px_rgba(249,115,22,0.5)]',
    badge: 'bg-orange-500/15 text-orange-600',
  },
  soccer: {
    bar: 'from-emerald-500 via-lime-400 to-emerald-500',
    card: 'border-emerald-500/80 bg-emerald-500/5 shadow-[0_18px_40px_-18px_rgba(16,185,129,0.45)]',
    badge: 'bg-emerald-500/15 text-emerald-600',
  },
  tennis: {
    bar: 'from-yellow-500 via-lime-400 to-emerald-400',
    card: 'border-yellow-500/80 bg-yellow-500/5 shadow-[0_18px_40px_-18px_rgba(234,179,8,0.45)]',
    badge: 'bg-yellow-500/15 text-yellow-600',
  },
  running: {
    bar: 'from-sky-500 via-blue-400 to-sky-500',
    card: 'border-sky-500/80 bg-sky-500/5 shadow-[0_18px_40px_-18px_rgba(56,189,248,0.45)]',
    badge: 'bg-sky-500/15 text-sky-600',
  },
  cricket: {
    bar: 'from-rose-500 via-red-400 to-rose-500',
    card: 'border-rose-500/80 bg-rose-500/5 shadow-[0_18px_40px_-18px_rgba(244,63,94,0.45)]',
    badge: 'bg-rose-500/15 text-rose-600',
  },
  rugby: {
    bar: 'from-lime-500 via-emerald-400 to-lime-500',
    card: 'border-lime-500/80 bg-lime-500/5 shadow-[0_18px_40px_-18px_rgba(132,204,22,0.45)]',
    badge: 'bg-lime-500/15 text-lime-600',
  },
  baseball: {
    bar: 'from-cyan-500 via-sky-400 to-cyan-500',
    card: 'border-cyan-500/80 bg-cyan-500/5 shadow-[0_18px_40px_-18px_rgba(6,182,212,0.45)]',
    badge: 'bg-cyan-500/15 text-cyan-600',
  },
  lacrosse: {
    bar: 'from-purple-500 via-indigo-400 to-purple-500',
    card: 'border-purple-500/80 bg-purple-500/5 shadow-[0_18px_40px_-18px_rgba(168,85,247,0.45)]',
    badge: 'bg-purple-500/15 text-purple-600',
  },
  'american-football': {
    bar: 'from-amber-600 via-orange-500 to-amber-600',
    card: 'border-amber-600/80 bg-amber-500/5 shadow-[0_18px_40px_-18px_rgba(217,119,6,0.5)]',
    badge: 'bg-amber-500/15 text-amber-600',
  },
}

const privacyOptions = [
  { id: 'public', label: 'Public', description: 'Anyone on the platform can see my clips.' },
  { id: 'followers', label: 'Followers', description: 'Only followers can watch my clips.' },
  { id: 'private', label: 'Private', description: 'Only I can see my clips until I change this later.' },
] as const

const steps = ['sports', 'profile', 'goals'] as const
type Step = typeof steps[number]

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
          label: `${sportName} · ${goal.label}`,
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

  const handleFinish = async () => {
    if (!session?.user) {
      toast({
        title: 'Please sign in again',
        description: 'Your session expired. Log in and try once more.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const fallbackName = session.user.user_metadata?.full_name || session.user.email || 'Athlete'
      const finalName = displayName.trim() || fallbackName
      const baseUsername = finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const username = baseUsername ? baseUsername.slice(0, 24) : null

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
      const { error: profileError } = await profilesClient
        .from('profiles')
        .upsert({
          id: session.user.id,
          display_name: finalName,
          username: username || null,
          location: location.trim() || null,
          bio: profileBioParts.join(' | ') || null,
        })

      if (profileError) {
        throw profileError
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

      await refreshProfile()

      router.replace('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Try again.'
      toast({
        title: 'Unable to finish onboarding',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AuthGuard>
      <div className='min-h-screen bg-background'>
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:py-16'>
          <header className='space-y-2 text-center'>
            <h1 className='text-3xl font-semibold sm:text-4xl'>Set up your AthletIQs profile</h1>
            <p className='text-sm text-muted-foreground sm:text-base'>Tell us how you train so your dashboard and recommendations stay relevant.</p>
          </header>

          <div className='flex items-center gap-4'>
            <Progress className='h-2 flex-1' value={progressPercent} />
            <span className='text-sm font-medium text-muted-foreground'>{progressPercent}%</span>
          </div>

          <Tabs value={currentStep} className='w-full'>
            <TabsList className='grid grid-cols-3'>
              <TabsTrigger value='sports'>Sports</TabsTrigger>
              <TabsTrigger value='profile'>Details</TabsTrigger>
              <TabsTrigger value='goals'>Goals</TabsTrigger>
            </TabsList>

            <TabsContent value='sports'>
              <Card>
                <CardHeader>
                  <CardTitle>Select your sports</CardTitle>
                  <CardDescription>Pick at least one sport to unlock tailored drills and leaderboards.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid gap-3 sm:grid-cols-2'>
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
                            'group relative flex h-full flex-col justify-between gap-3 rounded-xl border bg-card/40 p-4 text-left transition duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
                            selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/40',
                            selected && accent?.card
                          )}
                        >
                          <span
                            aria-hidden='true'
                            className={cn(
                              'pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r opacity-0 transition duration-200',
                              accent?.bar,
                              selected ? 'opacity-100' : 'group-hover:opacity-80'
                            )}
                          />
                          <div className='space-y-2'>
                            <h3 className='text-lg font-semibold'>{sport.name}</h3>
                            <p className='text-sm leading-snug text-muted-foreground'>{sport.summary}</p>
                          </div>
                          <div className='mt-auto flex items-center justify-between text-xs font-semibold'>
                            {selected ? (
                              <span
                                className={cn(
                                  'inline-flex items-center gap-2 rounded-full px-2 py-1',
                                  accent?.badge ?? 'bg-primary/10 text-primary'
                                )}
                              >
                                <Check className='h-3.5 w-3.5' />
                                Added
                              </span>
                            ) : (
                              <span className='text-muted-foreground/80'>Tap to add</span>
                            )}
                            <span className='text-[10px] uppercase tracking-wide text-muted-foreground/70'>
                              {selected ? 'Active' : 'Available'}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className='space-y-3'>
                    <p className='text-sm font-medium'>Current skill level</p>
                    <RadioGroup value={skillLevel} onValueChange={setSkillLevel} className='grid gap-3 sm:grid-cols-3'>
                      {skillLevels.map((level) => {
                        const selected = skillLevel === level.id
                        const inputId = `skill-${level.id}`
                        return (
                          <Label
                            key={level.id}
                            htmlFor={inputId}
                            className={cn(
                              'flex h-full cursor-pointer flex-col rounded-lg border bg-card/40 p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
                              selected ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40' : 'border-border hover:border-primary/60'
                            )}
                          >
                            <RadioGroupItem id={inputId} value={level.id} className='sr-only' />
                            <span className='font-semibold'>{level.label}</span>
                            <span className='mt-1 text-xs text-muted-foreground'>{level.description}</span>
                            {selected && (
                              <span className='mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary'>
                                <Check className='h-3 w-3' />
                                Selected
                              </span>
                            )}
                          </Label>
                        )
                      })}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='profile'>
              <Card>
                <CardHeader>
                  <CardTitle>Profile details</CardTitle>
                  <CardDescription>Fill out the essentials so teammates can find you and we can tailor your recommendations.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-5'>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='displayName'>Display name</Label>
                      <Input
                        id='displayName'
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder='Jordan Taylor'
                        required
                        autoComplete='name'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='location'>Location</Label>
                      <Input
                        id='location'
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder='Austin, TX'
                        required
                        autoComplete='address-level2'
                      />
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <p className='text-sm font-medium'>Gender</p>
                    <RadioGroup value={gender} onValueChange={setGender} className='grid gap-3 sm:grid-cols-2'>
                      {genderOptions.map((option) => {
                        const selected = gender === option.id
                        const inputId = `gender-${option.id}`
                        return (
                          <Label
                            key={option.id}
                            htmlFor={inputId}
                            className={cn(
                              'flex cursor-pointer flex-col rounded-lg border bg-card/40 p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
                              selected ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40' : 'border-border hover:border-primary/60'
                            )}
                          >
                            <RadioGroupItem id={inputId} value={option.id} className='sr-only' />
                            <span className='font-semibold'>{option.label}</span>
                            {selected && (
                              <span className='mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary'>
                                <Check className='h-3 w-3' />
                                Selected
                              </span>
                            )}
                          </Label>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='affiliation'>Team or club</Label>
                    <Input
                      id='affiliation'
                      value={affiliation}
                      onChange={(event) => setAffiliation(event.target.value)}
                      placeholder='River City United'
                    />
                  </div>

                  <div className='space-y-3'>
                    <p className='text-sm font-medium'>Account privacy</p>
                    <RadioGroup value={privacy} onValueChange={(value) => setPrivacy(value as typeof privacy)} className='grid gap-3 sm:grid-cols-3'>
                      {privacyOptions.map((option) => (
                        <Label
                          key={option.id}
                          className={cn(
                            'flex cursor-pointer flex-col rounded-lg border bg-card/40 p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
                            privacy === option.id ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/40' : 'border-border hover:border-primary/60'
                          )}
                        >
                          <RadioGroupItem value={option.id} className='sr-only' />
                          <span className='font-semibold'>{option.label}</span>
                          <span className='mt-1 text-xs text-muted-foreground'>{option.description}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='goals'>
              <Card>
                <CardHeader>
                  <CardTitle>Training focus</CardTitle>
                  <CardDescription>Select the areas you want to work on first. You can update these later.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-6'>
                    {goalCatalog.sections.map((section) => (
                      <div key={section.sportSlug} className='space-y-2'>
                        <p className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70'>
                          {section.sportName}
                        </p>
                        <div className='grid gap-3 sm:grid-cols-2'>
                          {section.items.map((goal) => {
                            const checked = selectedGoals.includes(goal.id)
                            const checkboxId = `goal-${goal.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
                            return (
                              <Label
                                key={goal.id}
                                htmlFor={checkboxId}
                                className={cn(
                                  'flex cursor-pointer items-start gap-3 rounded-lg border bg-card/40 p-4 text-left transition duration-200',
                                  checked ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30' : 'border-border hover:border-primary/60'
                                )}
                              >
                                <Checkbox
                                  id={checkboxId}
                                  checked={checked}
                                  onCheckedChange={() => toggleGoal(goal.id)}
                                />
                                <span className='space-y-1'>
                                  <span className='text-sm font-semibold'>{goal.label}</span>
                                  {goal.description && <span className='text-xs text-muted-foreground'>{goal.description}</span>}
                                </span>
                              </Label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground'>
                    Tip: updating your goals keeps the streak tracker honest and makes new clip recommendations more accurate.
                  </div>

                  <div className='rounded-lg border border-dashed bg-card/30 p-4'>
                    <div className='flex items-start gap-3'>
                      <Checkbox
                        id='safe-recording'
                        checked={hasAcceptedTerms}
                        onCheckedChange={(value) => setHasAcceptedTerms(value === true)}
                      />
                      <div className='space-y-1 text-sm'>
                        <Label htmlFor='safe-recording' className='cursor-pointer font-semibold'>
                          Safe recording pledge
                        </Label>
                        <p className='text-xs text-muted-foreground'>
                          I will not film minors or teammates without explicit permission, and I’ll respect facility policies about recording.
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          I understand that breaking this trust can remove my access to posting clips.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <Button variant='outline' onClick={goPrevious} disabled={stepIndex === 0}>Back</Button>

            <div className='flex-1 text-center text-xs text-muted-foreground sm:text-left'>
              {currentStep === 'sports' && 'Choose at least one sport to continue.'}
              {currentStep === 'profile' && 'Add your name, location, and gender so teammates can find you.'}
              {currentStep === 'goals' && 'Pick at least one focus area and agree to the safe recording pledge.'}
            </div>

            {stepIndex === steps.length - 1 ? (
              <Button onClick={handleFinish} disabled={isSaving || !canFinish}>
                {isSaving ? 'Saving...' : 'Finish onboarding'}
              </Button>
            ) : (
              <Button onClick={goNext} disabled={!canContinue()}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}










