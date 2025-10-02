import { NextResponse } from 'next/server'

import { createServerClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient({ response }) as SupabaseClient<any>
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
    let hasProfile = false
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle<{ id: string }>()

    if (profileError) {
      console.error('[api/auth/callback] profile lookup', profileError)
    }

    if (profile?.id) {
      hasProfile = true
    } else {
      const fallbackName =
        typeof user.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name
          : user.email?.split('@')[0] ?? 'Athlete'
      const defaultProfile: ProfileInsert = {
        id: user.id,
        display_name: fallbackName,
        username: typeof user.user_metadata?.user_name === 'string' ? user.user_metadata.user_name : null,
        avatar_url: typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null,
      }

      const { data: upsertedProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert(defaultProfile, { onConflict: 'id' })
        .select('id')
        .maybeSingle<{ id: string }>()

      if (upsertError) {
        console.error('[api/auth/callback] profile upsert', upsertError)
      }

      hasProfile = Boolean(upsertedProfile?.id)

      if (!hasProfile) {
        destination = '/dashboard'
      }
    }
  } else {
    destination = '/login?error=auth'
  }

  const finalUrl = new URL(destination, request.url)
  response.headers.set('Location', finalUrl.toString())
  return response
}
