import Dexie, { type Table } from 'dexie';
import type { Task, Day, Settings, GameState, Ritual } from '../types';

export class PulseDB extends Dexie {
  tasks!: Table<Task>;
  days!: Table<Day>;
  settings!: Table<Settings & { key: string }>;
  gameState!: Table<GameState & { key: string }>;
  rituals!: Table<Ritual>;

  constructor() {
    super('PulseDB');
    
    this.version(1).stores({
      tasks: 'id, status, createdAt, [status+createdAt], isDaily3',
      days: 'date, streak',
      settings: 'key',
      gameState: 'key',
      rituals: 'id, type'
    });
  }
}

export const db = new PulseDB();

// Initialize default settings
export async function initializeDB() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      key: 'main',
      mode: 'Mixed',
      theme: 'dark',
      reduceMotion: false,
      soundEnabled: false,
      hapticsEnabled: true,
      gracePerMonth: 2,
      crisisEnabled: false,
    });
  }

  const gameStateCount = await db.gameState.count();
  if (gameStateCount === 0) {
    await db.gameState.add({
      key: 'main',
      currentStreak: 0,
      longestStreak: 0,
      totalXP: 0,
      level: 1,
      graceRemaining: 2,
      lastActiveDate: new Date().toISOString().split('T')[0],
    });
  }

  // Initialize default rituals
  const ritualsCount = await db.rituals.count();
  if (ritualsCount === 0) {
    await db.rituals.bulkAdd([
      {
        id: 'morning-default',
        name: 'Morning Routine',
        type: 'morning',
        tasks: ['Drink water', 'Take meds', 'Quick stretch'],
        enabled: true,
      },
      {
        id: 'evening-default',
        name: 'Shutdown Routine',
        type: 'evening',
        tasks: ['Review tomorrow', 'Prep clothes', 'Phone on charge'],
        enabled: true,
      },
    ]);
  }
}
