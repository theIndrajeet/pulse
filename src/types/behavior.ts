export interface BehaviorPack {
  taskCap: number;
  timerMin: number;
  graceDays: number;
  animations: 'low' | 'medium' | 'high';
  sounds: boolean;
  nightWindDown: string | null;
  showCrisisButton: boolean;
  autosuggestTags: boolean;
  eveningCopy: boolean;
  focusSessionLimit: number | null;
  cooldownPromptAfter: string | number | null;
  defaultFriction: 'none' | 'overwhelm' | 'low_mood' | 'anxiety' | 'racing_mind';
  quickWinXP: number;
  focusXP: number;
  daily3XP: {
    move: number;
    hard: number;
    admin: number;
  };
  cooldownBehavior?: {
    type: 'reset-timer' | 'gentle-win' | 'wind-down';
    duration?: number;
    xp?: number;
    message: string;
  };
  overdriveLimits?: {
    tasksPerDay: number;
    focusSessionsEvening: number;
    eveningStart: string;
  };
}

export type BehaviorMode = 'default' | 'adhd' | 'bpd' | 'bipolar';

export interface BehaviorPacks {
  default: BehaviorPack;
  adhd: BehaviorPack;
  bpd: BehaviorPack;
  bipolar: BehaviorPack;
}

export interface DailyCheckIn {
  date: string;
  mood: number; // -2 to 2
  energy: 'low' | 'medium' | 'high';
  friction?: 'overwhelm' | 'low_mood' | 'anxiety' | 'racing_mind';
}

export interface CrisisContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
}

export interface SafetySettings {
  crisisContacts: CrisisContact[];
  safetyScript?: string;
  pinProtected: boolean;
}

export interface MicroIntervention {
  id: string;
  type: 'grounding' | 'breathing' | 'opposite_action';
  title: string;
  description: string;
  steps: string[];
  duration: number; // minutes
  xp: number;
  pairsWidth: ('anxiety' | 'overwhelm' | 'avoidance')[];
}
