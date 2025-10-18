'use client'

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import {
  PLACEHOLDER_AUTH_COOKIE,
  PLACEHOLDER_AUTH_COOKIE_VALUE,
  PLACEHOLDER_AUTH_EVENT,
  PLACEHOLDER_AUTH_MAX_AGE_SECONDS,
  PLACEHOLDER_AUTH_STORAGE_KEY,
  isPlaceholderAuthEnabled,
} from '@/lib/auth-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { BrandWordmark } from '@/components/brand-wordmark'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isOauthLoading, setIsOauthLoading] = useState(false)
  const [isMagicLoading, setIsMagicLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const placeholderAuthEnabled = useMemo(() => isPlaceholderAuthEnabled(), [])
  const redirectTarget = useMemo(() => {
    const requested = searchParams?.get('redirectedFrom')
    if (requested && requested.startsWith('/') && !requested.startsWith('//')) {
      return requested
    }
    return '/dashboard'
  }, [searchParams])
  const activatePlaceholderSession = useCallback(
    (target: string) => {
      if (!placeholderAuthEnabled) {
        return false
      }

      if (typeof document !== 'undefined') {
        const cookieAttributes = [
          `${PLACEHOLDER_AUTH_COOKIE}=${PLACEHOLDER_AUTH_COOKIE_VALUE}`,
          'path=/',
          `max-age=${PLACEHOLDER_AUTH_MAX_AGE_SECONDS}`,
          'SameSite=Lax',
        ]

        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          cookieAttributes.push('Secure')
        }

        document.cookie = cookieAttributes.join('; ')

        try {
          window.localStorage.setItem(PLACEHOLDER_AUTH_STORAGE_KEY, 'true')
        } catch {
          // ignore storage write failures
        }

        try {
          window.dispatchEvent(new Event(PLACEHOLDER_AUTH_EVENT))
        } catch {
          // ignore event dispatch failures
        }
      }

      router.push(target)
      return true
    },
    [placeholderAuthEnabled, router],
  )

  useEffect(() => {
    if (searchParams?.get('error') === 'auth') {
      toast({
        title: 'Authentication error',
        description: 'Please try signing in again.',
        variant: 'destructive',
      })
    }
  }, [searchParams, toast])

  const buildCallbackUrl = useCallback((nextPath: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    if (!origin) {
      return undefined
    }
    const url = new URL('/api/auth/callback', origin)
    url.searchParams.set('next', nextPath)
    return url.toString()
  }, [])

  const handleGoogleLogin = useCallback(async () => {
    setIsOauthLoading(true)

    try {
      if (activatePlaceholderSession(redirectTarget)) {
        return
      }

      const redirectTo = buildCallbackUrl(redirectTarget)
      if (!redirectTo) {
        throw new Error('Unable to determine redirect target.')
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      toast({
        title: 'Google sign-in failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsOauthLoading(false)
    }
  }, [activatePlaceholderSession, buildCallbackUrl, redirectTarget, supabase, toast])

  const handlePasswordLogin = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!email.trim() || !password.trim()) {
        toast({
          title: 'Missing credentials',
          description: 'Enter your email and password to sign in.',
          variant: 'destructive',
        })
        return
      }

      setIsPasswordLoading(true)

      try {
        if (activatePlaceholderSession(redirectTarget)) {
          setPassword('')
          return
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        setPassword('')
        router.push(redirectTarget)
      } catch (error) {
        toast({
          title: 'Email sign-in failed',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsPasswordLoading(false)
      }
    },
    [activatePlaceholderSession, email, password, redirectTarget, router, supabase, toast]
  )

  const handleMagicLink = useCallback(async () => {
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address to receive a magic link.',
        variant: 'destructive',
      })
      return
    }

    setIsMagicLoading(true)
    try {
      const redirectTo = buildCallbackUrl(redirectTarget)
      if (!redirectTo) {
        throw new Error('Unable to determine redirect target.')
      }
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) {
        throw error
      }
      toast({
        title: 'Check your inbox',
        description: 'We sent you a magic link to sign in.',
      })
      router.push('/login')
    } catch (error) {
      toast({
        title: 'Magic link failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsMagicLoading(false)
    }
  }, [buildCallbackUrl, email, redirectTarget, router, supabase, toast])

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/60 p-4">
      <span className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl transition-all dark:bg-primary/10" aria-hidden="true" />
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/95 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex flex-col items-center gap-2">
            <Image
              src="/logo-128.png"
              alt="AthletIQs logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg"
              priority
            />
            <BrandWordmark className="text-3xl leading-none" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue training with AthletIQs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isPasswordLoading || isMagicLoading || isOauthLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPasswordLoading || isMagicLoading || isOauthLoading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPasswordLoading || isMagicLoading || isOauthLoading}
            >
              {isPasswordLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                void handleMagicLink()
              }}
              disabled={isMagicLoading || isPasswordLoading || isOauthLoading}
            >
              {isMagicLoading ? 'Sending magic link...' : 'Send magic link instead'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleGoogleLogin}
            disabled={isOauthLoading || isMagicLoading || isPasswordLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isOauthLoading ? 'Redirecting...' : 'Continue with Google'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/" className="text-primary hover:underline">
              Get started
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
