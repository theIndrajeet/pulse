import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { BehaviorEngine } from './BehaviorEngine';
import type { Computed } from './BehaviorEngine';
import type { Mode, Energy } from './behavior-packs';
import { useSettingsStore } from '../stores/settingsStore';

interface BehaviorContextType {
  engine: BehaviorEngine;
  computed: Computed;
  mode: Mode;
  setMode: (mode: Mode) => void;
  applyCheckIn: (mood: -2 | -1 | 0 | 1 | 2, energy: Energy) => void;
  recordFocusSession: (minutes?: number) => void;
  recordCompletion: () => void;
  streakDays: number;
  graceDaysLeft: number;
}

const BehaviorContext = createContext<BehaviorContextType | undefined>(undefined);

// Global engine instance
const engine = new BehaviorEngine();

export function BehaviorProvider({ children }: { children: React.ReactNode }) {
  const settingsMode = useSettingsStore((state) => state.mode);
  const setSettingsMode = useSettingsStore((state) => state.setMode);
  const [computed, setComputed] = useState<Computed>(engine.compute());
  const [streakDays, setStreakDays] = useState(engine.getState().streakDays);
  const [graceDaysLeft, setGraceDaysLeft] = useState(engine.getState().graceDaysLeft);

  // Map settings mode to behavior mode
  useEffect(() => {
    const modeMap: Record<string, Mode> = {
      'ADHD': 'adhd',
      'BPD': 'bpd',
      'Bipolar': 'bipolar',
      'Mixed': 'default'
    };
    const behaviorMode = modeMap[settingsMode] || 'default';
    
    if (engine.getMode() !== behaviorMode) {
      engine.setMode(behaviorMode);
      updateState();
    }
  }, [settingsMode]);

  // Update computed state
  const updateState = useCallback(() => {
    setComputed(engine.compute());
    const state = engine.getState();
    setStreakDays(state.streakDays);
    setGraceDaysLeft(state.graceDaysLeft);
  }, []);

  // Initial setup
  useEffect(() => {
    // Roll streak on app load
    engine.rollStreakIfNeeded();
    updateState();

    // Update every minute to catch time-based changes
    const interval = setInterval(updateState, 60000);
    return () => clearInterval(interval);
  }, [updateState]);

  // API methods
  const setMode = useCallback((mode: Mode) => {
    engine.setMode(mode);
    // Update settings store
    const modeMap: Record<Mode, 'ADHD' | 'BPD' | 'Bipolar' | 'Mixed'> = {
      'adhd': 'ADHD',
      'bpd': 'BPD',
      'bipolar': 'Bipolar',
      'default': 'Mixed'
    };
    setSettingsMode(modeMap[mode]);
    updateState();
  }, [setSettingsMode, updateState]);

  const applyCheckIn = useCallback((mood: -2 | -1 | 0 | 1 | 2, energy: Energy) => {
    engine.applyCheckIn({ mood, energy });
    updateState();
  }, [updateState]);

  const recordFocusSession = useCallback((minutes = 0) => {
    engine.recordFocusSession(minutes);
    updateState();
  }, [updateState]);

  const recordCompletion = useCallback(() => {
    engine.recordCompletion();
    updateState();
  }, [updateState]);

  const value = useMemo(() => ({
    engine,
    computed,
    mode: engine.getMode(),
    setMode,
    applyCheckIn,
    recordFocusSession,
    recordCompletion,
    streakDays,
    graceDaysLeft
  }), [computed, setMode, applyCheckIn, recordFocusSession, recordCompletion, streakDays, graceDaysLeft]);

  return (
    <BehaviorContext.Provider value={value}>
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

// Convenience hooks
export function useBehaviorComputed() {
  const { computed } = useBehavior();
  return computed;
}

export function useStreakInfo() {
  const { streakDays, graceDaysLeft } = useBehavior();
  return { streakDays, graceDaysLeft };
}
