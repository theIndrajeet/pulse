import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import behaviorPacksData from '../data/behavior-packs.json';
import type { BehaviorPack, BehaviorMode, BehaviorPacks, DailyCheckIn } from '../types/behavior';
import { useSettingsStore } from '../stores/settingsStore';

interface BehaviorContextType {
  currentBehavior: BehaviorPack;
  currentMode: BehaviorMode;
  todaysCheckIn: DailyCheckIn | null;
  setDailyCheckIn: (checkIn: DailyCheckIn) => void;
  getAdjustedTaskCap: () => number;
  getAdjustedTimerMin: () => number;
  shouldShowNightPrompt: () => boolean;
  isOverdriveWarning: (taskCount: number, focusSessions: number) => boolean;
  canAddMoreTasks: (currentTaskCount: number) => boolean;
}

const BehaviorContext = createContext<BehaviorContextType | undefined>(undefined);

const behaviorPacks = behaviorPacksData as BehaviorPacks;

export function BehaviorProvider({ children }: { children: React.ReactNode }) {
  const mode = useSettingsStore((state) => state.mode);
  const [currentMode, setCurrentMode] = useState<BehaviorMode>('default');
  const [todaysCheckIn, setTodaysCheckIn] = useState<DailyCheckIn | null>(null);

  // Map settings mode to behavior mode
  useEffect(() => {
    const modeMap: Record<string, BehaviorMode> = {
      'ADHD': 'adhd',
      'BPD': 'bpd',
      'Bipolar': 'bipolar',
      'Mixed': 'default'
    };
    setCurrentMode(modeMap[mode] || 'default');
  }, [mode]);

  // Load today's check-in from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`pulse-checkin-${today}`);
    if (stored) {
      setTodaysCheckIn(JSON.parse(stored));
    }
  }, []);

  const currentBehavior = behaviorPacks[currentMode];

  const setDailyCheckIn = useCallback((checkIn: DailyCheckIn) => {
    const today = new Date().toISOString().split('T')[0];
    const checkInWithDate = { ...checkIn, date: today };
    setTodaysCheckIn(checkInWithDate);
    localStorage.setItem(`pulse-checkin-${today}`, JSON.stringify(checkInWithDate));
  }, []);

  const getAdjustedTaskCap = useCallback(() => {
    let cap = currentBehavior.taskCap;
    
    // Adjust based on energy level
    if (todaysCheckIn?.energy === 'low') {
      cap = Math.max(1, cap - 1);
    } else if (todaysCheckIn?.energy === 'high' && currentMode === 'bipolar') {
      // Don't increase cap for bipolar in high energy
      cap = Math.min(cap, 3);
    }
    
    return cap;
  }, [currentBehavior.taskCap, todaysCheckIn, currentMode]);

  const getAdjustedTimerMin = useCallback(() => {
    let timer = currentBehavior.timerMin;
    
    // Reduce timer for low energy
    if (todaysCheckIn?.energy === 'low') {
      timer = Math.max(5, timer - 5);
    }
    
    return timer;
  }, [currentBehavior.timerMin, todaysCheckIn]);

  const shouldShowNightPrompt = useCallback(() => {
    if (!currentBehavior.nightWindDown) return false;
    
    const now = new Date();
    const [hours, minutes] = currentBehavior.nightWindDown.split(':').map(Number);
    const windDownTime = new Date();
    windDownTime.setHours(hours, minutes, 0, 0);
    
    return now >= windDownTime;
  }, [currentBehavior.nightWindDown]);

  const isOverdriveWarning = useCallback((taskCount: number, focusSessions: number) => {
    if (currentMode !== 'bipolar' || !currentBehavior.overdriveLimits) return false;
    
    const now = new Date();
    const [hours] = currentBehavior.overdriveLimits.eveningStart.split(':').map(Number);
    const isEvening = now.getHours() >= hours;
    
    if (isEvening && focusSessions >= currentBehavior.overdriveLimits.focusSessionsEvening) {
      return true;
    }
    
    if (taskCount > currentBehavior.overdriveLimits.tasksPerDay) {
      return true;
    }
    
    return false;
  }, [currentMode, currentBehavior.overdriveLimits]);

  const canAddMoreTasks = useCallback((currentTaskCount: number) => {
    const cap = getAdjustedTaskCap();
    
    // High energy bipolar mode has strict limits
    if (currentMode === 'bipolar' && todaysCheckIn?.energy === 'high') {
      return currentTaskCount < 3;
    }
    
    return currentTaskCount < cap;
  }, [getAdjustedTaskCap, currentMode, todaysCheckIn]);

  return (
    <BehaviorContext.Provider value={{
      currentBehavior,
      currentMode,
      todaysCheckIn,
      setDailyCheckIn,
      getAdjustedTaskCap,
      getAdjustedTimerMin,
      shouldShowNightPrompt,
      isOverdriveWarning,
      canAddMoreTasks
    }}>
      {children}
    </BehaviorContext.Provider>
  );
}

export function useBehavior() {
  const context = useContext(BehaviorContext);
  if (!context) {
    throw new Error('useBehavior must be used within a BehaviorProvider');
  }
  return context;
}
