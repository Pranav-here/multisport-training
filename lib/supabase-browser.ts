import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/types/database'

function initBrowserClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

export type SupabaseBrowserClient = ReturnType<typeof initBrowserClient>

let browserClient: SupabaseBrowserClient | null = null

export function getSupabaseBrowserClient(): SupabaseBrowserClient {
  if (browserClient) {
    return browserClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase browser environment variables are not configured.')
  }

  browserClient = initBrowserClient(supabaseUrl, supabaseAnonKey)

  return browserClient
}

