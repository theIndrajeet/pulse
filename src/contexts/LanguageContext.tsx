import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import languagePacksData from '../data/language-packs.json';
import type { LanguageMode, LanguagePacks } from '../types/language';
import { useSettingsStore } from '../stores/settingsStore';

interface LanguageContextType {
  currentMode: LanguageMode;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  setMode: (mode: LanguageMode) => void;
  isNightMode: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languagePacks = languagePacksData as LanguagePacks;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const mode = useSettingsStore((state) => state.mode);
  const [currentMode, setCurrentMode] = useState<LanguageMode>('default');
  const [isNightMode, setIsNightMode] = useState(false);

  // Map settings mode to language mode
  useEffect(() => {
    const modeMap: Record<string, LanguageMode> = {
      'ADHD': 'adhd',
      'BPD': 'bpd',
      'Bipolar': 'bipolar',
      'Mixed': 'default'
    };
    setCurrentMode(modeMap[mode] || 'default');
  }, [mode]);

  // Check for night mode (after 10 PM for bipolar mode)
  useEffect(() => {
    const checkNightMode = () => {
      const hour = new Date().getHours();
      setIsNightMode(hour >= 22 || hour < 6);
    };

    checkNightMode();
    const interval = setInterval(checkNightMode, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Translation function with fallback
  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = languagePacks[currentMode];
    
    // Navigate through the object
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to default language pack
        value = languagePacks.default;
        for (const k2 of keys) {
          value = value?.[k2];
        }
        break;
      }
    }

    // Return the key if not found
    if (typeof value !== 'string') {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // Replace placeholders
    if (replacements) {
      return value.replace(/{(\w+)}/g, (match, key) => {
        return replacements[key]?.toString() || match;
      });
    }

    return value;
  }, [currentMode]);

  const setMode = useCallback((mode: LanguageMode) => {
    setCurrentMode(mode);
    // Update settings store
    const modeMap: Record<LanguageMode, 'ADHD' | 'BPD' | 'Bipolar' | 'Mixed'> = {
      'adhd': 'ADHD',
      'bpd': 'BPD',
      'bipolar': 'Bipolar',
      'default': 'Mixed'
    };
    useSettingsStore.getState().setMode(modeMap[mode]);
  }, []);

  return (
    <LanguageContext.Provider value={{ currentMode, t, setMode, isNightMode }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Helper hook for mood-specific responses
export function useMoodResponse() {
  const { t } = useLanguage();
  
  return useCallback((mood: number): string => {
    if (mood <= -1) return t('mood.responses.low');
    if (mood === 0) return t('mood.responses.neutral');
    return t('mood.responses.high');
  }, [t]);
}

// Helper hook for time-based messages (bipolar night mode)
export function useTimeBasedMessage() {
  const { currentMode, isNightMode, t } = useLanguage();
  
  return useCallback((key: string, replacements?: Record<string, string | number>): string => {
    // Special handling for bipolar mode at night
    if (currentMode === 'bipolar' && isNightMode) {
      const nightKey = `${key}Night`;
      const nightValue = t(nightKey, replacements);
      if (nightValue !== nightKey) {
        return nightValue;
      }
    }
    return t(key, replacements);
  }, [currentMode, isNightMode, t]);
}
