import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { initializeDB } from './db';
import { useTaskStore } from './stores/taskStore';
import { useGameStore } from './stores/gameStore';
import { useSettingsStore } from './stores/settingsStore';
import { useAuthStore } from './stores/authStore';
import { LanguageProvider } from './contexts/LanguageContext';
import { BehaviorProvider, useBehavior } from './behavior/BehaviorProvider';
import Header from './components/Header';
import TaskInput from './components/TaskInput';
import Daily3Strip from './components/Daily3Strip';
import TaskList from './components/TaskList';
import ActionButtons from './components/ActionButtons';
import MoodSelector from './components/MoodSelector';
import EnhancedOnboarding from './components/EnhancedOnboarding';
import DailyCheckIn from './components/DailyCheckIn';
import SafetyLayer from './components/SafetyLayer';
import LaterDrawer from './components/LaterDrawer';
import CooldownMode from './components/CooldownMode';
import StatsModal from './components/StatsModal';
import SettingsModal from './components/SettingsModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import AuthModal from './components/AuthModal';
import SocialMoodFeed from './components/SocialMoodFeed';
import LeaderboardModal from './components/LeaderboardModal';
import FriendsModal from './components/FriendsModal';
import { initializeTheme } from './theme/theme';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showLaterDrawer, setShowLaterDrawer] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadGameState = useGameStore((state) => state.loadGameState);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const { initialize: initializeAuth } = useAuthStore();

  useEffect(() => {
    async function initialize() {
      // Initialize theme early (before any DB loads)
      initializeTheme();
      
      await initializeDB();
      await Promise.all([
        loadSettings(),
        loadGameState(),
        loadTasks(),
        initializeAuth(), // Initialize social features
      ]);
      
      // Check if first time user
      const hasOnboarded = localStorage.getItem('pulseOnboarded');
      if (!hasOnboarded) {
        setShowOnboarding(true);
      } else {
        // Check if daily check-in needed
        const today = new Date().toISOString().split('T')[0];
        const todaysCheckIn = localStorage.getItem(`pulse-checkin-${today}`);
        if (!todaysCheckIn) {
          setShowDailyCheckIn(true);
        }
      }
      
      setIsInitialized(true);
    }
    initialize();
  }, [loadSettings, loadGameState, loadTasks]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl font-semibold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  // Show onboarding if first time
  if (showOnboarding) {
    return (
      <LanguageProvider>
        <BehaviorProvider>
          <EnhancedOnboarding onComplete={() => setShowOnboarding(false)} />
        </BehaviorProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <BehaviorProvider>
        <AppContent
          showDailyCheckIn={showDailyCheckIn}
          setShowDailyCheckIn={setShowDailyCheckIn}
          showSafety={showSafety}
          setShowSafety={setShowSafety}
          showLaterDrawer={showLaterDrawer}
          setShowLaterDrawer={setShowLaterDrawer}
          showCooldown={showCooldown}
          setShowCooldown={setShowCooldown}
          showStats={showStats}
          setShowStats={setShowStats}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          showAuth={showAuth}
          setShowAuth={setShowAuth}
          showLeaderboard={showLeaderboard}
          setShowLeaderboard={setShowLeaderboard}
          showFriends={showFriends}
          setShowFriends={setShowFriends}
        />
      </BehaviorProvider>
    </LanguageProvider>
  );
}

function AppContent({
  showDailyCheckIn,
  setShowDailyCheckIn,
  showSafety,
  setShowSafety,
  showLaterDrawer,
  setShowLaterDrawer,
  showCooldown,
  setShowCooldown,
  showStats,
  setShowStats,
  showSettings,
  setShowSettings,
  showAuth,
  setShowAuth,
  showLeaderboard,
  setShowLeaderboard,
  showFriends,
  setShowFriends,
}: {
  showDailyCheckIn: boolean;
  setShowDailyCheckIn: (show: boolean) => void;
  showSafety: boolean;
  setShowSafety: (show: boolean) => void;
  showLaterDrawer: boolean;
  setShowLaterDrawer: (show: boolean) => void;
  showCooldown: boolean;
  setShowCooldown: (show: boolean) => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showAuth: boolean;
  setShowAuth: (show: boolean) => void;
  showLeaderboard: boolean;
  setShowLeaderboard: (show: boolean) => void;
  showFriends: boolean;
  setShowFriends: (show: boolean) => void;
}) {
  // const { t } = useLanguage();
  const { computed } = useBehavior();
  const tasks = useTaskStore((state) => state.tasks);
  const { xp, xpForNextLevel, totalCompleted } = useGameStore();

  // Theme sync with behavior engine
  useEffect(() => {
    const themeMode = localStorage.getItem('theme') || 'auto';
    
    if (themeMode === 'auto') {
      // Handle automatic theme switching based on time and behavior
      const hour = new Date().getHours();
      const isNightTime = hour >= 19.5 || hour < 6.5;
      const shouldUseNight = isNightTime || computed.shouldOfferWindDown;
      
      document.documentElement.setAttribute('data-theme', shouldUseNight ? 'night' : 'day');
    }
  }, [computed.shouldOfferWindDown]);

  // Show wind-down prompt if needed
  useEffect(() => {
    if (computed.shouldOfferWindDown && computed.mode === 'bipolar') {
      const today = new Date().toDateString();
      const shownKey = `winddown-shown-${today}`;
      if (!localStorage.getItem(shownKey)) {
        localStorage.setItem(shownKey, 'true');
        setShowCooldown(true);
      }
    }
  }, [computed.shouldOfferWindDown, computed.mode, setShowCooldown]);

  const activeTasks = tasks.filter(t => !t.completed && !t.isDaily3);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className={`min-h-screen bg-bg text-ink transition-colors anim-${computed.animations} ${computed.shouldDimAnimations ? 'anim-low' : ''}`}>
      {/* Single Column Layout */}
      <div className="container-narrow py-8">
        <Header 
          onStatsClick={() => setShowStats(true)}
          onSettingsClick={() => setShowSettings(true)}
          onSafetyClick={computed.showCrisisButton ? () => setShowSafety(true) : undefined}
          onAuthClick={() => setShowAuth(true)}
          onLeaderboardClick={() => setShowLeaderboard(true)}
          onFriendsClick={() => setShowFriends(true)}
        />
        
        <main>
          {/* Today Section */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="section-title">Today</h2>
            <TaskInput />
          </motion.section>

          {/* Daily 3 */}
          {tasks.some(t => t.isDaily3) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Daily3Strip tasks={tasks} />
            </motion.div>
          )}

          {/* Missions */}
          {activeTasks.length > 0 && (
            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="section-title">Missions</h2>
              <TaskList tasks={activeTasks} />
            </motion.section>
          )}

          {/* Focus Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ActionButtons />
          </motion.div>

          {/* Mood Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MoodSelector />
          </motion.div>

          {/* Social Mood Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <SocialMoodFeed />
          </motion.div>

          {/* Quick Stats */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="section-title">Stats</h2>
            <div className="card p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Progress</p>
                  <p className="text-2xl font-semibold mt-1">{xp}/{xpForNextLevel} XP</p>
                  <div className="mt-2">
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(xp / xpForNextLevel) * 100}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Total Tasks</p>
                  <p className="text-2xl font-semibold mt-1">{totalCompleted}</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <motion.section 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="section-title text-muted">Completed</h2>
              <TaskList tasks={completedTasks} isCompleted />
            </motion.section>
          )}
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDailyCheckIn && (
          <DailyCheckIn onComplete={() => setShowDailyCheckIn(false)} />
        )}
        {showSafety && (
          <SafetyLayer onClose={() => setShowSafety(false)} />
        )}
        {showLaterDrawer && (
          <LaterDrawer onClose={() => setShowLaterDrawer(false)} />
        )}
        {showCooldown && (
          <CooldownMode onClose={() => setShowCooldown(false)} />
        )}
        {showStats && (
          <StatsModal onClose={() => setShowStats(false)} />
        )}
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
        {showAuth && (
          <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        )}
        {showLeaderboard && (
          <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
        )}
        {showFriends && (
          <FriendsModal isOpen={showFriends} onClose={() => setShowFriends(false)} />
        )}
      </AnimatePresence>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;