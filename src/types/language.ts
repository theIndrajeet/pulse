export interface LanguagePack {
  meta: {
    name: string;
    emoji: string;
  };
  
  header: {
    title: string;
    tagline: string;
    nav: {
      statistics: string;
      archives: string;
      editorial: string;
      settings: string;
    };
    edition: {
      left: string;
      center: string;
      right: string;
    };
  };

  bulletin: {
    title: string;
    submitLabel: string;
    hint: string;
    urgentTag: string;
    publishBtn: string;
  };

  input: {
    placeholder: string;
    addBtn: string;
    hashtagsHint: string;
  };

  missions: {
    sectionTitle: string;
    completionLabel: string;
    completionValue: string;
    emptyBoardTitle: string;
    slotEmpty: string;
    slotAwaiting: string;
    completeBtn: string;
    editBtn: string;
    deleteBtn: string;
    postponeBtn: string;
    restoreBtn: string;
    labelHard: string;
    labelMove: string;
    labelAdmin: string;
    pointsLabel: string;
    laterDrawer: string;
    laterCount: string;
  };

  dailyThree: {
    sectionTitle: string;
    deckTitle: string;
    deckSub: string;
    cards: {
      move: { title: string; desc: string; points: string };
      hard: { title: string; desc: string; points: string };
      admin: { title: string; desc: string; points: string };
    };
    progress: string;
    progressCounter: string;
    celebration: string;
  };

  mood: {
    panelTitle: string;
    currentForecast: string;
    scale: {
      '-2': { label: string; icon: string; forecast: string };
      '-1': { label: string; icon: string; forecast: string };
      '0': { label: string; icon: string; forecast: string };
      '1': { label: string; icon: string; forecast: string };
      '2': { label: string; icon: string; forecast: string };
    };
    weekly: string;
    labels: string[];
    responses: {
      low: string;
      neutral: string;
      high: string;
    };
  };

  productivity: {
    panelTitle: string;
    timerTitle: string;
    timerReady: string;
    timerRunning: string;
    startBtn: string;
    pauseBtn: string;
    timesUp: {
      title: string;
      message: string;
      points: string;
    };
  };

  cooldown: {
    panelTitle: string;
    cta: string;
    active: string;
    exitBtn: string;
    nightPrompt?: string;
  };

  stats: {
    panelTitle: string;
    modalTitle: string;
    performanceReport: string;
    streak: string;
    streakValue: string;
    xp: string;
    xpValue: string;
    level: string;
    levelValue: string;
    currentRun: string;
    bestEver: string;
    todaysGame: string;
    tasksCompleted: string;
    weeklyChart: string;
    xpToNext: string;
    closeBtn: string;
  };

  toasts: {
    added: string;
    completed: string;
    deleted: string;
    postponed: string;
    restored: string;
    cooldownOn: string;
    cooldownOff: string;
    levelUp: string;
    streakSaved: string;
    nightWarning?: string;
  };

  footer: string;
}

export type LanguageMode = 'default' | 'adhd' | 'bpd' | 'bipolar';

export interface LanguagePacks {
  default: LanguagePack;
  adhd: LanguagePack;
  bpd: LanguagePack;
  bipolar: LanguagePack;
}
