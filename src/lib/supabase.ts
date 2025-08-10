import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client (if needed for other purposes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export interface UserKey {
  id: string
  user_id: string
  public_key: string
  created_at: string
}
