export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  dueDate?: string;
  urgency: 'normal' | 'medium' | 'high';
  isDaily3?: boolean;
}

export interface Day {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  daily3Done: boolean;
  cooldownDone: boolean;
  graceUsed: boolean;
  streak: number;
  xp: number;
  mood?: -2 | -1 | 0 | 1 | 2;
  focusMinutes?: number;
}

export interface Settings {
  mode: 'ADHD' | 'BPD' | 'Bipolar' | 'Mixed';
  theme: 'light' | 'dark' | 'highContrast';
  reduceMotion: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  gracePerMonth: number;
  crisisEnabled: boolean;
  overdriverHour?: number; // 24hr format
  pin?: string;
  crisisContacts?: CrisisContact[];
}

export interface CrisisContact {
  name: string;
  number: string;
  type: 'hotline' | 'personal' | 'emergency';
}

export interface GameState {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  graceRemaining: number;
  lastActiveDate: string;
}

export interface Ritual {
  id: string;
  name: string;
  type: 'morning' | 'evening';
  tasks: string[];
  enabled: boolean;
}
