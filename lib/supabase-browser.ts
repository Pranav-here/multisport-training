﻿import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

let browserClient: SupabaseClient<Database> | null = null

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase browser environment variables are not configured.')
  }

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

  return browserClient
}