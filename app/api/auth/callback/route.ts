import { NextResponse } from 'next/server'

import { createServerClient } from '@/lib/supabase-server'

function resolveRedirectPath(candidate: string | null | undefined) {
  if (!candidate) {
    return '/dashboard'
  }
  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return '/dashboard'
  }
  return candidate
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const rawNext = requestUrl.searchParams.get('next')
  const fallbackRedirect = resolveRedirectPath(rawNext)

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  const supabase = await createServerClient({ response })
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[api/auth/callback] exchangeCodeForSession', exchangeError)
    response.headers.set('Location', new URL('/login?error=auth', request.url).toString())
    return response
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('[api/auth/callback] getUser', userError)
  }

  const user = userResult?.user
  let destination = fallbackRedirect

  if (user) {
    // Check if user has completed onboarding
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, username, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[api/auth/callback] profile lookup', profileError)
    }

    // Check if user has any sports configured
    const { data: userSports, error: sportsError } = await supabase
      .from('user_sports')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (sportsError) {
      console.error('[api/auth/callback] user_sports lookup', sportsError)
    }

    // Redirect to onboarding if:
    // 1. No profile exists, OR
    // 2. Profile exists but no display name/username, OR
    // 3. No sports configured
    const needsOnboarding =
      !profile ||
      (!profile.display_name && !profile.username) ||
      !userSports ||
      userSports.length === 0

    if (needsOnboarding) {
      destination = '/onboarding'
    }
  } else {
    destination = '/login?error=auth'
  }

  const finalUrl = new URL(destination, request.url)
  response.headers.set('Location', finalUrl.toString())
  return response
}

