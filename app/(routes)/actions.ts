'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { PLACEHOLDER_AUTH_COOKIE } from '@/lib/auth-placeholder'
import { createServerClient } from '@/lib/supabase-server'

export async function logout() {
  try {
    const supabase = createServerClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.warn('[logout] Supabase sign-out skipped', error)
  }

  cookies().set({
    name: PLACEHOLDER_AUTH_COOKIE,
    value: '',
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  })

  redirect('/login')
}
