import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface User {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  created_at: string
}

export interface MoodShare {
  id: string
  user_id: string
  mood: -2 | -1 | 0 | 1 | 2
  energy: 'low' | 'med' | 'high'
  message?: string
  shared_with: string[] // User IDs who can see this
  created_at: string
  user?: User // Joined user data
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  friend?: User // Joined friend data
  user?: User // Joined user data (for requests)
}

export interface UserStats {
  user_id: string
  current_streak: number
  longest_streak: number
  total_xp: number
  level: number
  mood_shares_count: number
  last_active_date: string
  updated_at: string
  user?: User // Joined user data
}

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  avatar_url?: string
  current_streak: number
  longest_streak: number
  total_xp: number
  level: number
  rank: number
}
