import { create } from 'zustand'
import { supabase, type User } from '../lib/supabase'
// import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  isLoading: boolean
  isSignedIn: boolean
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Pick<User, 'display_name' | 'avatar_url'>>) => Promise<boolean>
  initialize: () => Promise<void>
  syncLocalDataToUser: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isSignedIn: false,

  initialize: async () => {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth initialization error:', error)
        set({ isLoading: false })
        return
      }

      if (session?.user) {
        // Get user profile from our users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          set({ 
            user: profile, 
            isSignedIn: true, 
            isLoading: false 
          })
        } else {
          // Create profile if it doesn't exist
          const newUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: new Date().toISOString()
          }

          await supabase.from('users').insert(newUser)
          set({ user: newUser, isSignedIn: true, isLoading: false })
        }
      } else {
        set({ user: null, isSignedIn: false, isLoading: false })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            set({ user: profile, isSignedIn: true })
            // Sync local data to user account
            await get().syncLocalDataToUser()
          }
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, isSignedIn: false })
        }
      })
    } catch (error) {
      console.error('Auth initialization failed:', error)
      set({ isLoading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true })
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })

    if (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Create user profile
      const newUser: User = {
        id: data.user.id,
        email,
        display_name: displayName,
        created_at: new Date().toISOString()
      }

      await supabase.from('users').insert(newUser)
    }

    set({ isLoading: false })
    return { success: true }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, isSignedIn: false })
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return false

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (!error) {
        set({ user: { ...user, ...updates } })
        return true
      }
    } catch (error) {
      console.error('Profile update failed:', error)
    }
    return false
  },

  syncLocalDataToUser: async () => {
    const { user } = get()
    if (!user) return

    try {
      // Import existing game store functions
      const { useGameStore } = await import('./gameStore')
      const gameState = useGameStore.getState()

      // Create initial user stats entry
      const userStats = {
        user_id: user.id,
        current_streak: gameState.currentStreak,
        longest_streak: gameState.longestStreak,
        total_xp: gameState.totalXP,
        level: gameState.level,
        mood_shares_count: 0,
        last_active_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('user_stats')
        .upsert(userStats)

      console.log('Local data synced to user account')
    } catch (error) {
      console.error('Failed to sync local data:', error)
    }
  }
}))
