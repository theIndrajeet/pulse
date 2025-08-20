import { create } from 'zustand';
import { db } from '../db';
import type { Settings } from '../types';

interface SettingsStore extends Settings {
  isLoading: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  toggleTheme: () => Promise<void>;
  toggleMotion: () => Promise<void>;
  toggleSound: () => Promise<void>;
  setMode: (mode: Settings['mode']) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  mode: 'Mixed',
  theme: 'dark',
  reduceMotion: false,
  soundEnabled: false,
  hapticsEnabled: true,
  gracePerMonth: 2,
  crisisEnabled: false,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await db.settings.get('main');
      if (settings) {
        const { key, ...settingsWithoutKey } = settings;
        set({ ...settingsWithoutKey, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    set(updates);
    
    await db.settings.update('main', updates);
  },

  toggleTheme: async () => {
    const { theme, updateSettings } = get();
    const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'highContrast' : 'dark';
    await updateSettings({ theme: newTheme });
  },

  toggleMotion: async () => {
    const { reduceMotion, updateSettings } = get();
    await updateSettings({ reduceMotion: !reduceMotion });
  },

  toggleSound: async () => {
    const { soundEnabled, updateSettings } = get();
    await updateSettings({ soundEnabled: !soundEnabled });
  },

  setMode: async (mode) => {
    const { updateSettings } = get();
    
    // Apply mode-specific defaults
    const modeDefaults: Partial<Settings> = {
      mode,
      // ADHD: More animations, higher energy
      ...(mode === 'ADHD' && {
        reduceMotion: false,
        soundEnabled: true,
      }),
      // BPD: Crisis features enabled by default
      ...(mode === 'BPD' && {
        crisisEnabled: true,
      }),
      // Bipolar: Overdrive guard enabled
      ...(mode === 'Bipolar' && {
        overdriverHour: 22, // 10 PM default
      }),
    };
    
    await updateSettings(modeDefaults);
  },
}));
