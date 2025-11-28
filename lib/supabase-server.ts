import 'server-only'

import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr'

import type { Database } from '@/types/database'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not configured. Please set SUPABASE_URL/SUPABASE_ANON_KEY or their NEXT_PUBLIC equivalents.')
}

const resolvedSupabaseUrl = supabaseUrl as string
const resolvedSupabaseAnonKey = supabaseAnonKey as string

export interface CreateServerClientOptions {
  /**
   * Provide a response when you need Supabase to persist auth cookies.
   * This is required inside route handlers that call auth mutating methods.
   */
  response?: import('next/server').NextResponse
}

export async function createServerClient({ response }: CreateServerClientOptions = {}) {
  const cookieStore = await cookies()

  return createSupabaseServerClient<Database>(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        if (response) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...(options ?? {}) })
          })
          return
        }

        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options ?? {})
        })
      },
    },
  })
}

/**
 * Server-only helper to perform privileged operations such as storage signing.
 * Always wrap usage in trusted server paths. Never expose the service role key to clients.
 */
export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('Supabase service role key is not configured.')
  }

  return createSupabaseClient<Database>(resolvedSupabaseUrl, supabaseServiceRoleKey as string, {
    auth: {
      persistSession: false,
    },
  })
}


