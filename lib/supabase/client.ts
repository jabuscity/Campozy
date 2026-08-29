import { createClient as createBrowserClient } from '@supabase/supabase-js'

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase env keys')
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
  )
}

export default createClient
