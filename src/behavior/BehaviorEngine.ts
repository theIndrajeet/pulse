import { BEHAVIOR_PACKS } from "./behavior-packs";
import type { BehaviorPack, Mode, Energy, AnimLevel } from "./behavior-packs";

/** Storage wrapper (localStorage with in-memory fallback for SSR/tests) */
const memoryStore = new Map<string, string>();
const store = {
  get(key: string) {
    try { return localStorage.getItem(key) ?? memoryStore.get(key) ?? null; }
    catch { return memoryStore.get(key) ?? null; }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch {}
    memoryStore.set(key, value);
  }
};

type Mood = -2 | -1 | 0 | 1 | 2;

export interface CheckIn {
  date: string;        // YYYY-MM-DD
  mood: Mood;
  energy: Energy;
}

export interface EngineState {
  mode: Mode;
  checkIn?: CheckIn;
  focusSessionsToday: number;
  lastFocusAt?: string;            // ISO
  streakDays: number;
  lastActivityDate?: string;       // YYYY-MM-DD
  graceDaysLeft: number;
  graceSnapshotMonth?: string;     // YYYY-MM
}

export interface Computed {
  mode: Mode;
  taskCap: number;
  timerMin: number;
  animations: AnimLevel;
  sounds: boolean;
  showCrisisButton: boolean;
  eveningCopy: boolean;
  shouldOfferWindDown: boolean;
  shouldDimAnimations: boolean;
  requireConfirmAddTask: boolean;  // soft block
}

const todayStr = (d = new Date()) => d.toISOString().slice(0,10);
const ym = (d = new Date()) => d.toISOString().slice(0,7);

/** "HH:mm" → minutes since midnight */
const hhmmToMin = (t?: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h*60 + (m || 0);
};
const minsNow = () => {
  const n = new Date(); return n.getHours()*60 + n.getMinutes();
};
const isAfter = (hhmm?: string | null) => {
  const m = hhmmToMin(hhmm); if (m == null) return false;
  return minsNow() >= m;
};

export class BehaviorEngine {
  private KEY = "pulse.behavior.state";
  private packs: Record<Mode, BehaviorPack>;
  private state: EngineState;

  constructor(packs: Record<Mode, BehaviorPack> = BEHAVIOR_PACKS) {
    this.packs = packs;
    this.state = this.load() ?? this.bootstrap();
    this.monthlyGraceReset();
    this.dailyCountersReset();
  }

  // ---------- public API ----------

  getMode(): Mode { return this.state.mode; }
  setMode(mode: Mode) {
    this.state.mode = mode;
    // when switching modes, refresh grace to that mode's quota if new month
    this.monthlyGraceReset(true);
    this.persist();
  }

  getState(): Readonly<EngineState> { return this.state; }

  /** Apply a quick check-in and persist. Adjusts caps/timer dynamically. */
  applyCheckIn({ mood, energy }: { mood: Mood; energy: Energy; }) {
    this.state.checkIn = { date: todayStr(), mood, energy };
    this.markActivity(); // counts as activity for streak logic
    this.persist();
  }

  /** Call when a focus session completes (in minutes). */
  recordFocusSession(_minutes = 0) {
    this.dailyCountersReset();
    this.state.focusSessionsToday += 1;
    this.state.lastFocusAt = new Date().toISOString();
    this.markActivity();
    this.persist();
  }

  /** Call when a task completes or a Daily-Three card is done. */
  recordCompletion() {
    this.markActivity();
    this.persist();
  }

  /** Main "what should the UI do right now?" computation */
  compute(now = new Date()): Computed {
    const mode = this.state.mode;
    const pack = this.packs[mode];

    // Base values from pack
    let taskCap = pack.taskCap;
    let timerMin = pack.timerMin;
    let animations: AnimLevel = pack.animations;
    let sounds = !!pack.sounds;
    let showCrisisButton = !!pack.showCrisisButton;
    let eveningCopy = !!pack.eveningCopy;

    // Apply daily check-in modifiers
    const ci = this.state.checkIn?.date === todayStr(now) ? this.state.checkIn : undefined;
    if (ci) {
      if (ci.energy === "low") { taskCap = Math.max(1, taskCap - 1); timerMin = Math.max(5, timerMin - 2); }
      if (ci.energy === "high") {
        // ADHD: keep timer short for momentum; Bipolar: guardrails later in day
        if (mode === "adhd") timerMin = Math.max(10, Math.min(20, timerMin)); 
      }
      // Very low mood → reduce animations
      if (ci.mood <= -1) animations = animations === "high" ? "medium" : "low";
    }

    // Night guardrails / wind-down (bipolar & packs with nightWindDown)
    const shouldOfferWindDown = isAfter(pack.nightWindDown);
    let shouldDimAnimations = false;
    let requireConfirmAddTask = false;

    if (mode === "bipolar") {
      // Dim after 21:00, soft-block adding tasks after 22:00
      shouldDimAnimations = isAfter(pack.overdrive?.dimAnimationsAfter ?? undefined);
      requireConfirmAddTask = isAfter(pack.overdrive?.softBlockNewTasksAfter ?? undefined);

      // If too many late sessions, also dim & suggest wind-down
      const after21 = new Date();
      after21.setHours(21,0,0,0);
      const lastFocus = this.state.lastFocusAt ? new Date(this.state.lastFocusAt) : null;
      const tooManyLate = (this.state.focusSessionsToday >= (pack.overdrive?.maxFocusSessionsAfter21 ?? 999)) &&
                          (!!lastFocus && lastFocus >= after21);
      if (tooManyLate) {
        shouldDimAnimations = true;
        requireConfirmAddTask = true;
      }
    }

    return {
      mode, taskCap, timerMin, animations, sounds,
      showCrisisButton, eveningCopy,
      shouldOfferWindDown, shouldDimAnimations, requireConfirmAddTask
    };
  }

  /** Streak math with grace: returns updated streak after a day tick. Call at app open. */
  rollStreakIfNeeded(now = new Date()) {
    const last = this.state.lastActivityDate;
    const today = todayStr(now);
    if (!last) return; // first run
    if (last === today) return;

    const gap = this.daysBetween(last, today);
    if (gap === 1) {
      // Missed yesterday → use grace if available, else pause (don't hard-reset)
      if (this.state.graceDaysLeft > 0) {
        this.state.graceDaysLeft -= 1;
        // streak unchanged
      } else {
        // pause wording; implementation: don't reset, but don't increment until next activity
        // We model as: streak remains; a "paused" flag could be exposed if you want.
      }
    } else if (gap > 1) {
      // Multi-day gap: consume as many grace days as possible
      const rem = Math.max(0, gap - 1);
      const use = Math.min(rem, this.state.graceDaysLeft);
      this.state.graceDaysLeft -= use;
      // if still have uncovered gap, treat as "pause"; keep the count but UI can show "paused"
    }
    this.persist();
  }

  // ---------- helpers ----------

  private bootstrap(): EngineState {
    const mode: Mode = "default";
    const pack = this.packs[mode];
    const state: EngineState = {
      mode,
      focusSessionsToday: 0,
      streakDays: 0,
      graceDaysLeft: pack.graceDaysPerMonth,
      graceSnapshotMonth: ym()
    };
    this.persist(state);
    return state;
  }

  private load(): EngineState | null {
    const raw = store.get(this.KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as EngineState; } catch { return null; }
  }

  private persist(next?: EngineState) {
    if (next) this.state = next;
    store.set(this.KEY, JSON.stringify(this.state));
  }

  private markActivity() {
    const today = todayStr();
    if (this.state.lastActivityDate !== today) {
      this.state.streakDays += 1; // increments on first activity of the day
      this.state.lastActivityDate = today;
    }
  }

  private daysBetween(a: string, b: string): number {
    const d1 = new Date(a + "T00:00:00");
    const d2 = new Date(b + "T00:00:00");
    return Math.round((+d2 - +d1) / 86_400_000);
  }

  private monthlyGraceReset(force = false) {
    const month = ym();
    if (force || this.state.graceSnapshotMonth !== month) {
      const quota = this.packs[this.state.mode].graceDaysPerMonth;
      this.state.graceDaysLeft = quota;
      this.state.graceSnapshotMonth = month;
      this.persist();
    }
  }

  private dailyCountersReset() {
    const today = todayStr();
    const last = this.state.lastFocusAt ? todayStr(new Date(this.state.lastFocusAt)) : undefined;
    if (last && last !== today) {
      this.state.focusSessionsToday = 0;
    }
  }
}
