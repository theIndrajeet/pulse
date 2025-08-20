import { create } from 'zustand'
import { supabase, type MoodShare, type Friendship, type LeaderboardEntry } from '../lib/supabase'
import { useAuthStore } from './authStore'
import { useGameStore } from './gameStore'

interface SocialStore {
  // Mood Sharing
  friendsMoods: MoodShare[]
  myMoodShares: MoodShare[]
  isLoadingMoods: boolean
  
  // Friends/Family
  friends: Friendship[]
  pendingFriendRequests: Friendship[]
  isLoadingFriends: boolean
  
  // Leaderboard
  leaderboard: LeaderboardEntry[]
  friendsLeaderboard: LeaderboardEntry[]
  myRank: number | null
  isLoadingLeaderboard: boolean
  
  // Actions - Mood Sharing
  shareMood: (mood: -2 | -1 | 0 | 1 | 2, energy: 'low' | 'med' | 'high', message?: string, sharedWith?: string[]) => Promise<boolean>
  loadFriendsMoods: () => Promise<void>
  loadMyMoodShares: () => Promise<void>
  
  // Actions - Friends Management
  sendFriendRequest: (friendEmail: string) => Promise<{ success: boolean; error?: string }>
  acceptFriendRequest: (requestId: string) => Promise<boolean>
  rejectFriendRequest: (requestId: string) => Promise<boolean>
  removeFriend: (friendshipId: string) => Promise<boolean>
  loadFriends: () => Promise<void>
  loadPendingRequests: () => Promise<void>
  
  // Actions - Leaderboard
  loadLeaderboard: () => Promise<void>
  loadFriendsLeaderboard: () => Promise<void>
  updateMyStats: () => Promise<void>
  
  // Real-time subscriptions
  subscribeToFriendsMoods: () => () => void
  subscribeToFriendRequests: () => () => void
  subscribeToLeaderboard: () => () => void
}

export const useSocialStore = create<SocialStore>((set, get) => ({
  // State
  friendsMoods: [],
  myMoodShares: [],
  isLoadingMoods: false,
  friends: [],
  pendingFriendRequests: [],
  isLoadingFriends: false,
  leaderboard: [],
  friendsLeaderboard: [],
  myRank: null,
  isLoadingLeaderboard: false,

  // Mood Sharing Actions
  shareMood: async (mood, energy, message, sharedWith) => {
    const user = useAuthStore.getState().user
    if (!user) return false

    try {
      // Default to sharing with all friends if not specified
      if (!sharedWith) {
        const { friends } = get()
        sharedWith = friends
          .filter(f => f.status === 'accepted')
          .map(f => f.friend_id === user.id ? f.user_id : f.friend_id)
      }

      const moodShare: Omit<MoodShare, 'id' | 'created_at' | 'user'> = {
        user_id: user.id,
        mood,
        energy,
        message,
        shared_with: sharedWith
      }

      const { error } = await supabase
        .from('mood_shares')
        .insert(moodShare)

      if (!error) {
        // Update local game store mood
        useGameStore.getState().setMood(mood)
        
        // Update user stats
        await get().updateMyStats()
        
        // Reload moods to show the new one
        await get().loadMyMoodShares()
        return true
      }

      console.error('Failed to share mood:', error)
      return false
    } catch (error) {
      console.error('Share mood error:', error)
      return false
    }
  },

  loadFriendsMoods: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoadingMoods: true })

    try {
      // Get moods where I'm in the shared_with array
      const { data, error } = await supabase
        .from('mood_shares')
        .select(`
          *,
          user:users(display_name, avatar_url)
        `)
        .contains('shared_with', [user.id])
        .neq('user_id', user.id) // Don't include my own moods
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        set({ friendsMoods: data, isLoadingMoods: false })
      }
    } catch (error) {
      console.error('Load friends moods error:', error)
      set({ isLoadingMoods: false })
    }
  },

  loadMyMoodShares: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('mood_shares')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        set({ myMoodShares: data })
      }
    } catch (error) {
      console.error('Load my mood shares error:', error)
    }
  },

  // Friends Management Actions
  sendFriendRequest: async (friendEmail) => {
    const user = useAuthStore.getState().user
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      // Find user by email
      const { data: friendUser, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', friendEmail)
        .single()

      if (findError || !friendUser) {
        return { success: false, error: 'User not found' }
      }

      if (friendUser.id === user.id) {
        return { success: false, error: 'Cannot add yourself as a friend' }
      }

      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendUser.id}),and(user_id.eq.${friendUser.id},friend_id.eq.${user.id})`)

      if (existing && existing.length > 0) {
        return { success: false, error: 'Friend request already exists' }
      }

      // Create friend request
      const friendship: Omit<Friendship, 'id' | 'created_at' | 'friend' | 'user'> = {
        user_id: user.id,
        friend_id: friendUser.id,
        status: 'pending'
      }

      const { error } = await supabase
        .from('friendships')
        .insert(friendship)

      if (!error) {
        await get().loadFriends()
        return { success: true }
      }

      return { success: false, error: error.message }
    } catch (error) {
      console.error('Send friend request error:', error)
      return { success: false, error: 'Failed to send friend request' }
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      if (!error) {
        await get().loadFriends()
        await get().loadPendingRequests()
        return true
      }
    } catch (error) {
      console.error('Accept friend request error:', error)
    }
    return false
  },

  rejectFriendRequest: async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId)

      if (!error) {
        await get().loadPendingRequests()
        return true
      }
    } catch (error) {
      console.error('Reject friend request error:', error)
    }
    return false
  },

  removeFriend: async (friendshipId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)

      if (!error) {
        await get().loadFriends()
        return true
      }
    } catch (error) {
      console.error('Remove friend error:', error)
    }
    return false
  },

  loadFriends: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoadingFriends: true })

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:users!friendships_friend_id_fkey(id, display_name, avatar_url),
          user:users!friendships_user_id_fkey(id, display_name, avatar_url)
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (!error && data) {
        // Map friendships to show the other person as the friend
        const mappedFriends = data.map(friendship => ({
          ...friendship,
          friend: friendship.friend_id === user.id ? friendship.user : friendship.friend
        }))
        set({ friends: mappedFriends, isLoadingFriends: false })
      } else {
        set({ isLoadingFriends: false })
      }
    } catch (error) {
      console.error('Load friends error:', error)
      set({ isLoadingFriends: false })
    }
  },

  loadPendingRequests: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          user:users!friendships_user_id_fkey(display_name, avatar_url)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending')

      if (!error && data) {
        set({ pendingFriendRequests: data })
      }
    } catch (error) {
      console.error('Load pending requests error:', error)
    }
  },

  // Leaderboard Actions
  loadLeaderboard: async () => {
    set({ isLoadingLeaderboard: true })

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select(`
          *,
          user:users(display_name, avatar_url)
        `)
        .order('current_streak', { ascending: false })
        .limit(100)

      if (!error && data) {
        const leaderboard = data.map((entry, index) => ({
          user_id: entry.user_id,
          display_name: entry.user?.display_name || 'Anonymous',
          avatar_url: entry.user?.avatar_url,
          current_streak: entry.current_streak,
          longest_streak: entry.longest_streak,
          total_xp: entry.total_xp,
          level: entry.level,
          rank: index + 1
        }))

        set({ leaderboard, isLoadingLeaderboard: false })

        // Set my rank
        const user = useAuthStore.getState().user
        if (user) {
          const myEntry = leaderboard.find(entry => entry.user_id === user.id)
          set({ myRank: myEntry?.rank || null })
        }
      } else {
        set({ isLoadingLeaderboard: false })
      }
    } catch (error) {
      console.error('Load leaderboard error:', error)
      set({ isLoadingLeaderboard: false })
    }
  },

  loadFriendsLeaderboard: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const { friends } = get()
    const friendIds = friends
      .filter(f => f.status === 'accepted')
      .map(f => f.friend_id === user.id ? f.user_id : f.friend_id)
    
    // Add self to the list
    friendIds.push(user.id)

    if (friendIds.length === 0) return

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select(`
          *,
          user:users(display_name, avatar_url)
        `)
        .in('user_id', friendIds)
        .order('current_streak', { ascending: false })

      if (!error && data) {
        const friendsLeaderboard = data.map((entry, index) => ({
          user_id: entry.user_id,
          display_name: entry.user?.display_name || 'Anonymous',
          avatar_url: entry.user?.avatar_url,
          current_streak: entry.current_streak,
          longest_streak: entry.longest_streak,
          total_xp: entry.total_xp,
          level: entry.level,
          rank: index + 1
        }))

        set({ friendsLeaderboard })
      }
    } catch (error) {
      console.error('Load friends leaderboard error:', error)
    }
  },

  updateMyStats: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const gameState = useGameStore.getState()
      
      const userStats = {
        user_id: user.id,
        current_streak: gameState.currentStreak,
        longest_streak: gameState.longestStreak,
        total_xp: gameState.totalXP,
        level: gameState.level,
        last_active_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('user_stats')
        .upsert(userStats)

      // Reload leaderboards
      await get().loadLeaderboard()
      await get().loadFriendsLeaderboard()
    } catch (error) {
      console.error('Update my stats error:', error)
    }
  },

  // Real-time subscriptions
  subscribeToFriendsMoods: () => {
    const user = useAuthStore.getState().user
    if (!user) return () => {}

    const channel = supabase
      .channel('friends-moods')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mood_shares',
        filter: `shared_with.cs.{${user.id}}`
      }, () => {
        get().loadFriendsMoods()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  subscribeToFriendRequests: () => {
    const user = useAuthStore.getState().user
    if (!user) return () => {}

    const channel = supabase
      .channel('friend-requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `friend_id=eq.${user.id}`
      }, () => {
        get().loadPendingRequests()
        get().loadFriends()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  subscribeToLeaderboard: () => {
    const channel = supabase
      .channel('leaderboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_stats'
      }, () => {
        get().loadLeaderboard()
        get().loadFriendsLeaderboard()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}))
