import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr'

import {
  PLACEHOLDER_AUTH_COOKIE,
  PLACEHOLDER_AUTH_COOKIE_VALUE,
  PLACEHOLDER_AUTH_MAX_AGE_SECONDS,
  isPlaceholderAuthEnabled,
} from '@/lib/auth-placeholder'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const PROTECTED_PREFIXES = ['/dashboard', '/settings']
const PUBLIC_PATHS = ['/', '/about', '/guidelines', '/login']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl
  const placeholderAuthEnabled = isPlaceholderAuthEnabled()
  const isApiRoute = pathname.startsWith('/api')
  let placeholderSessionActive =
    placeholderAuthEnabled && request.cookies.get(PLACEHOLDER_AUTH_COOKIE)?.value === PLACEHOLDER_AUTH_COOKIE_VALUE

  if (placeholderAuthEnabled && !placeholderSessionActive && !isApiRoute) {
    response.cookies.set({
      name: PLACEHOLDER_AUTH_COOKIE,
      value: PLACEHOLDER_AUTH_COOKIE_VALUE,
      path: '/',
      maxAge: PLACEHOLDER_AUTH_MAX_AGE_SECONDS,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    })
    placeholderSessionActive = true
  }

  if (placeholderSessionActive) {
    if (pathname === '/login') {
      const redirectedFrom = request.nextUrl.searchParams.get('redirectedFrom')
      const target =
        redirectedFrom && redirectedFrom.startsWith('/') && !redirectedFrom.startsWith('//')
          ? redirectedFrom
          : '/dashboard'

      return NextResponse.redirect(new URL(target, request.url))
    }

    return response
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[middleware] Supabase environment variables are missing; bypassing auth checks.')
    return response
  }

  const supabase = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options?: CookieOptions) {
        response.cookies.set({
          name,
          value,
          ...(options ?? {}),
        })
      },
      remove(name: string, options?: CookieOptions) {
        if (options) {
          response.cookies.set({
            name,
            value: '',
            ...(options ?? {}),
          })
        }
        response.cookies.delete(name)
      },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isOnboardingRoute = pathname.startsWith('/onboarding')

  if (isApiRoute) {
    return response
  }

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    if (!PUBLIC_PATHS.includes(pathname)) {
      redirectUrl.searchParams.set('redirectedFrom', pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (!session) {
    return response
  }

  let hasProfile: boolean | null = null
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', session.user.id)
    .maybeSingle<{ id: string }>()

  if (profileError) {
    console.error('[middleware] profile lookup', profileError)
  } else {
    hasProfile = Boolean(profile?.id)
  }

  if (hasProfile === false && !isOnboardingRoute) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  if (hasProfile === true && isOnboardingRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/login') {
    const target = hasProfile === false ? '/onboarding' : '/dashboard'
    return NextResponse.redirect(new URL(target, request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/onboarding/:path*', '/login'],
}

