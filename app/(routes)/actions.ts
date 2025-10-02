﻿'use server'

import { redirect } from 'next/navigation'

import { createServerClient } from '@/lib/supabase-server'

export async function logout() {
  const supabase = createServerClient()

  await supabase.auth.signOut()

  redirect('/login')
}
