import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBehavior } from '../behavior/BehaviorProvider';
import type { Energy } from '../behavior/behavior-packs';
import { useLanguage } from '../contexts/LanguageContext';
import { useGameStore } from '../stores/gameStore';

interface DailyCheckInProps {
  onComplete: () => void;
}

export default function DailyCheckIn({ onComplete }: DailyCheckInProps) {
  const { applyCheckIn } = useBehavior();
  const { t, currentMode } = useLanguage();
  const { awardXP } = useGameStore();
  
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [step, setStep] = useState<'mood' | 'energy'>('mood');

  const moodOptions = [
    { value: -2, emoji: '⛈️', label: t('mood.scale.-2.label') },
    { value: -1, emoji: '☁️', label: t('mood.scale.-1.label') },
    { value: 0, emoji: '⛅', label: t('mood.scale.0.label') },
    { value: 1, emoji: '☀️', label: t('mood.scale.1.label') },
    { value: 2, emoji: '🌟', label: t('mood.scale.2.label') },
  ];

  const energyOptions = [
    { value: 'low' as Energy, emoji: '🔋', label: 'Low', color: 'text-red-600' },
    { value: 'med' as Energy, emoji: '🔋🔋', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high' as Energy, emoji: '🔋🔋🔋', label: 'High', color: 'text-green-600' },
  ];

  const handleMoodSelect = (value: number) => {
    setMood(value);
    setStep('energy');
  };

  const handleEnergySelect = (value: Energy) => {
    setEnergy(value);
    
    // Apply check-in to behavior engine
    applyCheckIn(mood as (-2 | -1 | 0 | 1 | 2), value);
    awardXP(5); // Small XP for checking in
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onComplete();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-paper-bg max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="bg-ink-black text-paper-bg p-6">
          <h2 className="font-headline text-3xl">DAILY CHECK-IN</h2>
          <p className="font-typewriter text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'mood' && (
              <motion.div
                key="mood"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-headline text-2xl mb-6">
                  How's your mood today?
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {moodOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => handleMoodSelect(option.value)}
                      className="flex flex-col items-center p-4 border-2 border-ink-black hover:bg-accent-gold/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-3xl mb-2">{option.emoji}</span>
                      <span className="font-typewriter text-xs">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'energy' && (
              <motion.div
                key="energy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-headline text-2xl mb-6">
                  How's your energy level?
                </h3>
                <div className="space-y-3">
                  {energyOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => handleEnergySelect(option.value)}
                      className="w-full flex items-center justify-between p-4 border-2 border-ink-black hover:bg-accent-gold/10 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="font-headline text-xl">{option.label}</span>
                      <span className={`text-2xl ${option.color}`}>{option.emoji}</span>
                    </motion.button>
                  ))}
                </div>
                
                {/* Context-specific message */}
                <div className="mt-6 p-4 bg-paper-aged">
                  <p className="font-typewriter text-sm">
                    {energy === 'low' && currentMode === 'bpd' && 
                      "That's okay. We'll keep things gentle today. 💙"
                    }
                    {energy === 'high' && currentMode === 'bipolar' && 
                      "High energy noted. We'll help you channel it wisely. 🌗"
                    }
                    {energy === 'low' && currentMode === 'adhd' && 
                      "Low battery mode activated. Smaller wins still count! ⚡"
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip button */}
          <div className="mt-8 text-center">
            <button
              onClick={onComplete}
              className="font-typewriter text-sm text-ink-faded hover:text-ink-black transition-colors"
            >
              Skip for today
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
