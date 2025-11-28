import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has completed onboarding by checking if they have a profile with required fields
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, username, onboarding_completed')
      .eq('id', user.id)
      .single()

    const profile = profileData as Database['public']['Tables']['profiles']['Row'] | null

    if (profileError) {
      // Profile doesn't exist yet, onboarding not completed
      return NextResponse.json({ completed: false })
    }

    // Check if user has selected sports
    const { data: userSports, error: sportsError } = await supabase
      .from('user_sports')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (sportsError || !userSports || userSports.length === 0) {
      return NextResponse.json({ completed: false })
    }

    // Consider onboarding completed if they have a display name and at least one sport
    const completed = Boolean(
      profile &&
        (profile.display_name || profile.username) &&
        userSports.length > 0
    )

    return NextResponse.json({ completed })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
