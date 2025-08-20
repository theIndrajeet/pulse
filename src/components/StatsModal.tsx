import { motion } from 'framer-motion';
import { X, TrendingUp, Award, Calendar, Target } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { useLanguage } from '../contexts/LanguageContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface StatsModalProps {
  onClose: () => void;
}

export default function StatsModal({ onClose }: StatsModalProps) {
  const { level, xp, xpForNextLevel, currentStreak, longestStreak, totalCompleted, moodHistory } = useGameStore();
  const { t } = useLanguage();

  // Calculate weekly stats
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const weeklyMoods = weekDays.map(day => {
    const mood = moodHistory.find(m => 
      new Date(m.date).toDateString() === day.toDateString()
    );
    return { day, mood: mood?.mood || 0 };
  });

  const averageMood = moodHistory.length > 0
    ? (moodHistory.reduce((sum, m) => sum + m.mood, 0) / moodHistory.length).toFixed(1)
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Statistics</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
              aria-label="Close statistics"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Progress Overview */}
          <section>
            <h3 className="section-title text-lg mb-4">Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4 text-center">
                <Award className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-semibold">{level}</p>
                <p className="text-sm text-muted">Level</p>
              </div>
              
              <div className="card p-4 text-center">
                <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-semibold">{xp}/{xpForNextLevel}</p>
                <p className="text-sm text-muted">XP Progress</p>
              </div>
              
              <div className="card p-4 text-center">
                <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-semibold">{currentStreak}</p>
                <p className="text-sm text-muted">Current Streak</p>
              </div>
              
              <div className="card p-4 text-center">
                <Target className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-semibold">{totalCompleted}</p>
                <p className="text-sm text-muted">Tasks Completed</p>
              </div>
            </div>
          </section>

          {/* Mood Trends */}
          <section>
            <h3 className="section-title text-lg mb-4">Mood Trends</h3>
            <div className="card p-6">
              {/* Average Mood */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted">Average Mood</p>
                  <p className="text-3xl font-semibold">{averageMood}/5</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">Longest Streak</p>
                  <p className="text-3xl font-semibold">{longestStreak} days</p>
                </div>
              </div>

              {/* Weekly Mood Chart */}
              <div>
                <p className="text-sm text-muted mb-3">This Week</p>
                <div className="flex items-end justify-between gap-2 h-32">
                  {weeklyMoods.map(({ day, mood }, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-surface-alt rounded-t" style={{
                        height: mood > 0 ? `${(mood / 5) * 100}%` : '4px',
                        backgroundColor: mood > 0 ? 'var(--accent)' : 'var(--border-muted)'
                      }} />
                      <p className="text-xs text-muted mt-2">
                        {format(day, 'EEE')[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Recent Achievements */}
          <section>
            <h3 className="section-title text-lg mb-4">Recent Achievements</h3>
            <div className="card p-6">
              <div className="space-y-3">
                {level >= 5 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div>
                      <p className="font-medium">Level 5 Reached</p>
                      <p className="text-sm text-muted">You're making consistent progress!</p>
                    </div>
                  </div>
                )}
                
                {currentStreak >= 7 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-positive/20 flex items-center justify-center">
                      <span className="text-lg">🔥</span>
                    </div>
                    <div>
                      <p className="font-medium">Week Warrior</p>
                      <p className="text-sm text-muted">7 day streak achieved!</p>
                    </div>
                  </div>
                )}
                
                {totalCompleted >= 50 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-calm/20 flex items-center justify-center">
                      <span className="text-lg">✨</span>
                    </div>
                    <div>
                      <p className="font-medium">Task Master</p>
                      <p className="text-sm text-muted">50 tasks completed!</p>
                    </div>
                  </div>
                )}
                
                {!level || (level < 5 && currentStreak < 7 && totalCompleted < 50) && (
                  <p className="text-sm text-muted text-center py-4">
                    Keep going! Achievements will appear as you progress.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}