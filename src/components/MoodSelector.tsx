import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { Cloud, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBehaviorComputed } from '../behavior/BehaviorProvider';

export default function MoodSelector() {
  const { moodHistory } = useGameStore();
  const setMood = useGameStore((state) => state.setMood);
  const { t } = useLanguage();
  const computed = useBehaviorComputed();
  
  const todayMood = moodHistory.find(
    (m) => new Date(m.date).toDateString() === new Date().toDateString()
  );

  const moods = [
    { value: 5, icon: Sun, label: 'Excellent', color: 'text-positive' },
    { value: 4, icon: Cloud, label: 'Good', color: 'text-calm' },
    { value: 3, icon: Wind, label: 'Okay', color: 'text-ink' },
    { value: 2, icon: CloudRain, label: 'Difficult', color: 'text-warning' },
    { value: 1, icon: CloudSnow, label: 'Stormy', color: 'text-error' }
  ];

  const handleMoodSelect = (value: number) => {
    setMood(value);
  };

  return (
    <section className="mb-8">
      <h2 className="section-title">Mood Forecast</h2>
      
      <div className="card p-6">
        <p className="text-sm text-muted mb-4">
          {todayMood ? t('mood.updated') : t('mood.prompt')}
        </p>
        
        {/* Mood Icons */}
        <div className="flex justify-between mb-6">
          {moods.map((mood) => {
            const isSelected = todayMood?.mood === mood.value;
            const Icon = mood.icon;
            
            return (
              <motion.button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`group relative p-3 rounded-lg transition-all ${
                  isSelected 
                    ? 'bg-surface-alt shadow-raised' 
                    : 'hover:bg-surface-alt hover:shadow-ambient'
                }`}
              >
                <motion.div
                  animate={isSelected ? { rotate: [0, -10, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className={`w-8 h-8 transition-all duration-300 ${
                    isSelected ? mood.color : 'text-muted group-hover:text-ink'
                  }`} />
                </motion.div>
                
                {/* Tooltip */}
                <motion.span 
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap"
                  initial={{ opacity: 0, y: -5 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mood.label}
                </motion.span>
                
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="moodIndicator"
                    className="absolute inset-0 border-2 border-accent rounded-lg pointer-events-none"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Weekly Mood Tracker */}
        {moodHistory.length > 0 && (
          <>
            <hr className="border-border-muted my-6" />
            
            <div>
              <h3 className="text-sm font-medium mb-3">This Week</h3>
              <div className="flex gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dayMood = moodHistory.find(
                    (m) => new Date(m.date).toDateString() === date.toDateString()
                  );
                  
                  return (
                    <div key={i} className="flex-1 text-center">
                      <div className="text-xs text-muted mb-1">
                        {date.toLocaleDateString('en', { weekday: 'short' })[0]}
                      </div>
                      <div className={`w-2 h-2 rounded-full mx-auto ${
                        dayMood 
                          ? moods.find(m => m.value === dayMood.mood)?.color.replace('text-', 'bg-') || 'bg-muted'
                          : 'bg-border-muted'
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Subtle separator */}
      <hr className="separator-dotted" />
    </section>
  );
}