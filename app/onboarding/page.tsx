'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

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

const defaultSports = [
  { slug: 'basketball', name: 'Basketball', summary: 'Ball handling, shooting and footwork drills.' },
  { slug: 'soccer', name: 'Soccer', summary: 'First touch, agility and small sided training.' },
  { slug: 'tennis', name: 'Tennis', summary: 'Serve consistency, movement and recovery.' },
  { slug: 'running', name: 'Running', summary: 'Base mileage, intervals and pacing skills.' },
  { slug: 'cricket', name: 'Cricket', summary: 'Batting tempo, bowling control and fielding reps.' },
] as const

const skillLevels = [
  { id: 'starter', label: 'Starter', description: 'Learning the basics or returning after time away.' },
  { id: 'intermediate', label: 'Intermediate', description: 'Comfortable with fundamentals and building consistency.' },
  { id: 'advanced', label: 'Advanced', description: 'Competing regularly and chasing peak performance.' },
] as const

const generalGoals = [
  { id: 'endurance', label: 'Build endurance' },
  { id: 'strength', label: 'Increase strength' },
  { id: 'speed', label: 'Get faster and more explosive' },
  { id: 'technique', label: 'Clean up technique' },
  { id: 'consistency', label: 'Stay consistent every week' },
] as const

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
  const [skillLevel, setSkillLevel] = useState<string>('starter')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public')

  const [stepIndex, setStepIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const currentStep: Step = steps[stepIndex]
  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100)

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
        return Boolean(displayName.trim() || session?.user?.user_metadata?.full_name || session?.user?.email)
      case 'goals':
        return true
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
          goals: selectedGoals.join(', ') || null,
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

      toast({
        title: 'Profile saved',
        description: 'Your training preferences are ready to go.',
      })

      router.push('/dashboard')
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
            <h1 className='text-3xl font-semibold sm:text-4xl'>Set up your MultiSport profile</h1>
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
                    {(sports.length ? sports : defaultSports.map((item, index) => ({ id: index + 1, slug: item.slug, name: item.name, summary: item.summary })) ).map((sport) => {
                      const selected = selectedSports.includes(sport.slug)
                      return (
                        <button
                          key={sport.slug}
                          type='button'
                          onClick={() => toggleSport(sport.slug)}
                          className={`rounded-lg border p-4 text-left transition hover:border-primary ${selected ? 'border-primary bg-primary/5' : 'border-border'} `}
                        >
                          <h3 className='font-semibold'>{sport.name}</h3>
                          <p className='mt-1 text-sm text-muted-foreground'>{sport.summary}</p>
                          {selected && <p className='mt-2 text-xs font-medium text-primary'>Selected</p>}
                        </button>
                      )
                    })}
                  </div>

                  <div className='space-y-3'>
                    <p className='text-sm font-medium'>Current skill level</p>
                    <RadioGroup value={skillLevel} onValueChange={setSkillLevel} className='grid gap-3 sm:grid-cols-3'>
                      {skillLevels.map((level) => (
                        <Label key={level.id} className='flex cursor-pointer flex-col rounded-lg border p-4 text-left hover:border-primary'>
                          <RadioGroupItem value={level.id} className='sr-only' />
                          <span className='font-semibold'>{level.label}</span>
                          <span className='mt-1 text-xs text-muted-foreground'>{level.description}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='profile'>
              <Card>
                <CardHeader>
                  <CardTitle>Profile details</CardTitle>
                  <CardDescription>Let other athletes know who you are and where you play.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='displayName'>Display name</Label>
                      <Input
                        id='displayName'
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder='Jordan Taylor'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='location'>Location</Label>
                      <Input
                        id='location'
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder='Austin, TX'
                      />
                    </div>
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
                    <p className='text-sm font-medium'>Sharing preference</p>
                    <RadioGroup value={privacy} onValueChange={(value) => setPrivacy(value as typeof privacy)} className='grid gap-3 sm:grid-cols-3'>
                      {privacyOptions.map((option) => (
                        <Label key={option.id} className='flex cursor-pointer flex-col rounded-lg border p-4 text-left hover:border-primary'>
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
                <CardContent className='space-y-4'>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {generalGoals.map((goal) => {
                      const checked = selectedGoals.includes(goal.id)
                      return (
                        <Label key={goal.id} className='flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:border-primary'>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleGoal(goal.id)}
                          />
                          <span className='text-sm font-medium'>{goal.label}</span>
                        </Label>
                      )
                    })}
                  </div>

                  <div className='rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground'>
                    Tip: updating your goals keeps the streak tracker honest and makes new clip recommendations more accurate.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <Button variant='outline' onClick={goPrevious} disabled={stepIndex === 0}>Back</Button>

            <div className='flex-1 text-center text-xs text-muted-foreground sm:text-left'>
              {currentStep === 'sports' && 'Choose at least one sport to continue.'}
              {currentStep === 'profile' && 'Add a name so teammates can find you.'}
              {currentStep === 'goals' && 'Pick a few focus areas to personalize your feed.'}
            </div>

            {stepIndex === steps.length - 1 ? (
              <Button onClick={handleFinish} disabled={isSaving}>
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










