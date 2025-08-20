// Behavior packs = mode defaults. Tune numbers here, not in UI code.
export type Mode = "default" | "adhd" | "bpd" | "bipolar";

export type AnimLevel = "low" | "medium" | "high";
export type Energy = "low" | "med" | "high";

export interface BehaviorPack {
  taskCap: number;                 // Visible "Today" slots
  timerMin: number;                // Default focus minutes
  graceDaysPerMonth: number;       // Streak won't break within this quota
  animations: AnimLevel;
  sounds: boolean;
  autosuggestTags?: boolean;
  showCrisisButton?: boolean;
  eveningCopy?: boolean;           // Swap to calmer language at night
  nightWindDown?: string | null;   // e.g. "22:00"
  overdrive?: {
    maxFocusSessionsAfter21: number;   // Bipolar guardrail
    dimAnimationsAfter?: string | null;
    softBlockNewTasksAfter?: string | null; // UI should confirm before adding
  };
}

export const BEHAVIOR_PACKS: Record<Mode, BehaviorPack> = {
  default: {
    taskCap: 5,
    timerMin: 15,
    graceDaysPerMonth: 2,
    animations: "medium",
    sounds: false,
    eveningCopy: false,
    nightWindDown: null,
    overdrive: { maxFocusSessionsAfter21: 999 }
  },
  adhd: {
    taskCap: 3,
    timerMin: 15,
    graceDaysPerMonth: 2,
    animations: "high",
    sounds: true,
    autosuggestTags: true,
    showCrisisButton: false,
    eveningCopy: false,
    nightWindDown: null,
    overdrive: { maxFocusSessionsAfter21: 999 }
  },
  bpd: {
    taskCap: 2,
    timerMin: 10,
    graceDaysPerMonth: 4,
    animations: "low",
    sounds: false,
    showCrisisButton: true,
    eveningCopy: true,
    nightWindDown: null,
    overdrive: { maxFocusSessionsAfter21: 999 }
  },
  bipolar: {
    taskCap: 3,
    timerMin: 12,
    graceDaysPerMonth: 3,
    animations: "low",
    sounds: false,
    eveningCopy: true,
    nightWindDown: "22:00",
    overdrive: {
      maxFocusSessionsAfter21: 3,
      dimAnimationsAfter: "21:00",
      softBlockNewTasksAfter: "22:00"
    }
  }
};
