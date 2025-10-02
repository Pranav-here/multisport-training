import type { SupabaseClient } from '@supabase/supabase-js'

import { respondError, respondOk } from '@/lib/api-response'
import { createServerClient } from '@/lib/supabase-server'

export async function POST() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient() as SupabaseClient<any>
  const { data: auth } = await supabase.auth.getSession()

  if (!auth.session) {
    return respondError('UNAUTHORIZED', 'Sign in required.', 401)
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.rpc('increment_streak', { p_user: auth.session.user.id })
    if (error) {
      throw error
    }
  } catch (error) {
    console.error('[api/streak/increment] increment', error)
    return respondError('DATABASE_ERROR', 'Unable to increment streak.', 500)
  }

  return respondOk({ success: true })
}