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
  const supabase = createServerClient({ response })
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle<{ id: string }>()

    if (profileError) {
      console.error('[api/auth/callback] profile lookup', profileError)
    }

    if (!profileError) {
      destination = profile?.id ? destination : '/onboarding'
    }
  } else {
    destination = '/login?error=auth'
  }

  const finalUrl = new URL(destination, request.url)
  response.headers.set('Location', finalUrl.toString())
  return response
}

