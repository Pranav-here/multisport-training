import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

interface OnboardingData {
  sports: string[]
  username: string
  bio: string
  goals: {
    weeklySessions: number
    primarySport: string
  }
  preferredMode: 'training' | 'discovery'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as OnboardingData
    const { sports, username, bio, goals, preferredMode } = body

    // Map sport slugs to sport IDs
    const { data: sportsData, error: sportsError } = await supabase
      .from('sports')
      .select('id, slug')
      .in('slug', sports)

    if (sportsError) {
      console.error('Error fetching sports:', sportsError)
      return NextResponse.json(
        { error: 'Failed to fetch sports data' },
        { status: 500 }
      )
    }

    const sportIdMap = new Map(sportsData?.map((s) => [s.slug, s.id]) || [])

    // Upsert profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: username || 'Athlete',
      bio: bio || null,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, '_') || null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Delete existing user_sports entries
    const { error: deleteError } = await supabase
      .from('user_sports')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting user sports:', deleteError)
    }

    // Insert new user_sports entries
    const userSportsEntries = sports
      .map((slug) => {
        const sportId = sportIdMap.get(slug)
        if (!sportId) return null
        return {
          user_id: user.id,
          sport_id: sportId,
          skill_level: 'intermediate',
          goals: `${goals.weeklySessions}x per week`,
        }
      })
      .filter(Boolean)

    if (userSportsEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('user_sports')
        .insert(userSportsEntries)

      if (insertError) {
        console.error('Error inserting user sports:', insertError)
        return NextResponse.json(
          { error: 'Failed to save sport preferences' },
          { status: 500 }
        )
      }
    }

    // Save preferred mode preference (could be stored in profile or settings table)
    // For now, we'll just acknowledge it was provided

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
