'use client'

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [isOauthLoading, setIsOauthLoading] = useState(false)
  const [isMagicLoading, setIsMagicLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])

  useEffect(() => {
    if (searchParams?.get('error') === 'auth') {
      toast({
        title: 'Authentication error',
        description: 'Please try signing in again.',
        variant: 'destructive',
      })
    }
  }, [searchParams, toast])

  const buildCallbackUrl = (nextPath: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    if (!origin) {
      return undefined
    }
    const url = new URL('/api/auth/callback', origin)
    url.searchParams.set('next', nextPath)
    return url.toString()
  }

  const handleGoogleLogin = async () => {
    setIsOauthLoading(true)
    try {
      const redirectTo = buildCallbackUrl('/dashboard')
      if (!redirectTo) {
        throw new Error('Unable to determine redirect target.')
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) {
        toast({
          title: 'Google sign-in failed',
          description: error.message,
          variant: 'destructive',
        })
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
  }

  const handleMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address to receive a magic link.',
        variant: 'destructive',
      })
      return
    }

    setIsMagicLoading(true)
    try {
      const redirectTo = buildCallbackUrl('/onboarding')
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
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/60 p-4">
      <span className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl transition-all dark:bg-primary/10" aria-hidden="true" />
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/95 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-sport-blue to-sport-green flex items-center justify-center">
            <span className="text-white font-bold text-lg">MS</span>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue training with MultiSport.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isMagicLoading || isOauthLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isMagicLoading || isOauthLoading}>
              {isMagicLoading ? 'Sending magic link...' : 'Send magic link'}
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
            disabled={isOauthLoading || isMagicLoading}
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
