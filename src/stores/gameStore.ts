import { create } from 'zustand';
import { db } from '../db';
import type { GameState } from '../types';
import { getTodayDate, playSound, triggerHaptic } from '../utils/helpers';
import behaviorPacksData from '../data/behavior-packs.json';

interface GameStore extends GameState {
  todayCompleted: number;
  daily3Done: boolean;
  cooldownDone: boolean;
  mood?: -2 | -1 | 0 | 1 | 2;
  xp: number;
  xpForNextLevel: number;
  totalCompleted: number;
  moodHistory: Array<{ date: string; mood: number }>;
  
  // Actions
  loadGameState: () => Promise<void>;
  awardXP: (amount: number) => Promise<void>;
  completeTask: (isHardThing?: boolean, isDaily3?: string) => Promise<void>;
  completeCooldown: () => Promise<void>;
  setMood: (mood: -2 | -1 | 0 | 1 | 2 | number) => Promise<void>;
  checkAndUpdateStreak: () => Promise<void>;
  useGraceDay: () => Promise<void>;
  gainXP: (amount: number) => void;
}

const XP_VALUES = {
  ADD_TASK: 5,
  COMPLETE_TASK: 10,
  HARD_THING: 15,
  MOOD_CHECK: 5,
  COOLDOWN: 20,
  DAILY_3: 25,
};

const XP_PER_LEVEL = 200;

export const useGameStore = create<GameStore>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  totalXP: 0,
  level: 1,
  graceRemaining: 2,
  lastActiveDate: getTodayDate(),
  todayCompleted: 0,
  daily3Done: false,
  cooldownDone: false,
  mood: undefined,
  xp: 0,
  xpForNextLevel: XP_PER_LEVEL,
  totalCompleted: 0,
  moodHistory: [],

  loadGameState: async () => {
    try {
      const gameState = await db.gameState.get('main');
      const today = await db.days.get(getTodayDate());
      
      if (gameState) {
        const currentLevelXP = gameState.totalXP % XP_PER_LEVEL;
        set({
          ...gameState,
          todayCompleted: today?.tasksCompleted || 0,
          daily3Done: today?.daily3Done || false,
          cooldownDone: today?.cooldownDone || false,
          mood: today?.mood,
          xp: currentLevelXP,
          xpForNextLevel: XP_PER_LEVEL,
          totalCompleted: gameState.totalXP ? Math.floor(gameState.totalXP / 10) : 0,
          moodHistory: []
        });
      }
      
      // Check if we need to update streak
      await get().checkAndUpdateStreak();
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  },

  awardXP: async (amount) => {
    const { totalXP, level } = get();
    const newXP = totalXP + amount;
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
    
    if (newLevel > level) {
      // Level up!
      playSound('levelup');
      triggerHaptic('heavy');
      // TODO: Show level up animation
    }
    
    set({ totalXP: newXP, level: newLevel });
    
    await db.gameState.update('main', {
      totalXP: newXP,
      level: newLevel,
    });
  },

  completeTask: async (isHardThing, isDaily3) => {
    const { todayCompleted, awardXP } = get();
    const newCompleted = todayCompleted + 1;
    
    set({ todayCompleted: newCompleted });
    
    // Award XP
    if (isHardThing) {
      await awardXP(XP_VALUES.HARD_THING);
    } else {
      await awardXP(XP_VALUES.COMPLETE_TASK);
    }
    
    // Check if Daily-3 is complete
    if (isDaily3) {
      const today = await db.days.get(getTodayDate()) || { 
        date: getTodayDate(),
        tasksCompleted: 0,
        daily3Done: false,
        cooldownDone: false,
        graceUsed: false,
        streak: get().currentStreak,
        xp: 0
      };
      
      // Check if all 3 daily tasks are done (simplified for MVP)
      if (newCompleted >= 3 && !today.daily3Done) {
        set({ daily3Done: true });
        await awardXP(XP_VALUES.DAILY_3);
      }
    }
    
    playSound('complete');
    triggerHaptic('light');
    
    // Update today's record
    await db.days.put({
      date: getTodayDate(),
      tasksCompleted: newCompleted,
      daily3Done: get().daily3Done,
      cooldownDone: get().cooldownDone,
      graceUsed: false,
      streak: get().currentStreak,
      xp: get().totalXP,
      mood: get().mood,
    });
  },

  completeCooldown: async () => {
    set({ cooldownDone: true });
    await get().awardXP(XP_VALUES.COOLDOWN);
    
    await db.days.update(getTodayDate(), {
      cooldownDone: true,
    });
    
    playSound('cooldown');
    triggerHaptic('medium');
  },

  setMood: async (mood) => {
    const validMood = mood as -2 | -1 | 0 | 1 | 2;
    set({ mood: validMood });
    await get().awardXP(XP_VALUES.MOOD_CHECK);
    
    await db.days.update(getTodayDate(), {
      mood: validMood,
    });
  },

  checkAndUpdateStreak: async () => {
    const { currentStreak, longestStreak, lastActiveDate, graceRemaining } = get();
    const today = getTodayDate();
    const todayData = await db.days.get(today);
    
    // Get current mode's grace days
    const mode = localStorage.getItem('pulseMode') || 'default';
    const behaviorMode = mode.toLowerCase() as keyof typeof behaviorPacksData;
    const graceDaysPerMonth = behaviorPacksData[behaviorMode]?.graceDays || 2;
    
    // Check if streak should continue - more forgiving criteria
    const streakEarned = 
      (todayData?.tasksCompleted || 0) >= 1 || // Just 1 task
      todayData?.daily3Done || 
      todayData?.cooldownDone || 
      todayData?.mood !== undefined; // Even checking mood counts
    
    // Calculate days missed
    const lastDate = new Date(lastActiveDate);
    const currentDate = new Date(today);
    const daysMissed = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) - 1;
    
    if (daysMissed > 0 && daysMissed <= graceRemaining) {
      // Use grace days
      const graceUsed = Math.min(daysMissed, graceRemaining);
      set({ 
        graceRemaining: graceRemaining - graceUsed,
        lastActiveDate: today,
      });
      
      await db.gameState.update('main', {
        graceRemaining: graceRemaining - graceUsed,
        lastActiveDate: today,
      });
      
      // Streak continues!
      console.log(`Used ${graceUsed} grace day(s). Streak preserved!`);
    } else if (daysMissed > graceRemaining) {
      // Streak pauses (not breaks)
      set({ 
        currentStreak: 0,
        lastActiveDate: today,
      });
      
      await db.gameState.update('main', {
        currentStreak: 0,
        lastActiveDate: today,
      });
      
      console.log('Streak paused. It will resume on your next completion!');
    }
    
    if (streakEarned && daysMissed <= graceRemaining) {
      const newStreak = currentStreak + 1;
      const newLongest = Math.max(newStreak, longestStreak);
      
      set({ 
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      });
      
      await db.gameState.update('main', {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      });
    }
    
    // Reset grace days on the 1st of each month
    const date = new Date();
    if (date.getDate() === 1) {
      const lastReset = localStorage.getItem('pulse-grace-reset');
      const thisMonth = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (lastReset !== thisMonth) {
        set({ graceRemaining: graceDaysPerMonth });
        await db.gameState.update('main', {
          graceRemaining: graceDaysPerMonth,
        });
        localStorage.setItem('pulse-grace-reset', thisMonth);
      }
    }
  },

  useGraceDay: async () => {
    const { graceRemaining } = get();
    
    if (graceRemaining > 0) {
      set({ graceRemaining: graceRemaining - 1 });
      
      await db.gameState.update('main', {
        graceRemaining: graceRemaining - 1,
      });
      
      await db.days.update(getTodayDate(), {
        graceUsed: true,
      });
    }
  },

  gainXP: (amount) => {
    const { xp } = get();
    const newXP = xp + amount;
    const currentLevelXP = newXP % XP_PER_LEVEL;
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
    
    set({ 
      xp: currentLevelXP,
      totalXP: newXP,
      level: newLevel,
      xpForNextLevel: XP_PER_LEVEL
    });
  },
}));
