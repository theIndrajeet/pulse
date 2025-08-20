import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Droplet, HandMetal, RefreshCw, Moon, Heart } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';

import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/helpers';

interface CooldownModeProps {
  onClose: () => void;
}

const MICRO_ACTS = [
  { id: 'water', label: 'Drink water', icon: Droplet },
  { id: 'walk', label: 'Quick walk', icon: Wind },
  { id: 'wash', label: 'Wash face', icon: HandMetal },
];

export default function CooldownMode({ onClose }: CooldownModeProps) {
  const { t, currentMode } = useLanguage();
  const completeCooldown = useGameStore((state) => state.completeCooldown);
  
  // Different phases based on mode
  const [phase, setPhase] = useState<'main' | 'complete'>('main');
  const [adhdTimer, setAdhdTimer] = useState(180); // 3 minutes
  const [completedActs, setCompletedActs] = useState<Set<string>>(new Set());
  const [gentleWinCompleted, setGentleWinCompleted] = useState(false);

  // ADHD reset timer
  useEffect(() => {
    if (currentMode !== 'adhd' || phase !== 'main') return;
    
    const timer = setInterval(() => {
      setAdhdTimer((prev) => {
        if (prev <= 1) {
          completeCooldown();
          setPhase('complete');
          setTimeout(onClose, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMode, phase, completeCooldown, onClose]);

  const handleMicroAct = async (actId: string) => {
    const newCompleted = new Set([...completedActs, actId]);
    setCompletedActs(newCompleted);
    
    if (newCompleted.size >= 1) {
      await completeCooldown();
      setPhase('complete');
      setTimeout(onClose, 2000);
    }
  };

  const handleGentleWin = async () => {
    if (gentleWinCompleted) return;
    
    setGentleWinCompleted(true);
    const { awardXP } = useGameStore.getState();
    await awardXP(5);
    
    // Complete after gentle win
    setTimeout(async () => {
      await completeCooldown();
      setPhase('complete');
      setTimeout(onClose, 2000);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-paper-bg max-w-2xl w-full shadow-2xl"
      >
        {/* Header */}
        <div className="bg-ink-black text-paper-bg p-6">
          <div className="flex justify-between items-center">
            <h1 className="font-headline text-3xl">{t('cooldown.panelTitle')}</h1>
            <button
              onClick={onClose}
              className="text-paper-bg hover:text-accent-gold text-2xl"
              aria-label="Close cooldown"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {phase === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* ADHD Mode: Reset Timer */}
                {currentMode === 'adhd' && (
                  <div className="text-center">
                    <RefreshCw className="w-16 h-16 mx-auto mb-4 text-accent-gold animate-spin" />
                    <h2 className="font-headline text-4xl mb-4">RESET TIMER</h2>
                    <p className="font-typewriter text-xl mb-8">
                      Quick reset: breathe, stand, water!
                    </p>
                    <div className="font-headline text-6xl text-accent-gold">
                      {formatTime(adhdTimer)}
                    </div>
                    <div className="mt-8 space-y-2 font-typewriter">
                      <p>✓ Take 3 deep breaths</p>
                      <p>✓ Stand up and stretch</p>
                      <p>✓ Get a glass of water</p>
                    </div>
                  </div>
                )}

                {/* BPD Mode: Gentle Win */}
                {currentMode === 'bpd' && (
                  <div className="text-center">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-accent-blue" />
                    <h2 className="font-headline text-3xl mb-4">{t('cooldown.cta')}</h2>
                    <p className="font-typewriter text-lg mb-8">
                      One gentle win available
                    </p>
                    
                    {!gentleWinCompleted ? (
                      <motion.button
                        onClick={handleGentleWin}
                        className="news-article mx-auto max-w-md hover:translate-y-[-2px] transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="p-8">
                          <h3 className="font-headline text-2xl mb-2">ONE GENTLE WIN</h3>
                          <p className="font-typewriter">
                            Click here to acknowledge you're taking care of yourself
                          </p>
                          <p className="font-typewriter text-sm mt-2 text-accent-gold">
                            +5 XP
                          </p>
                        </div>
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl"
                      >
                        💙
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Bipolar Mode: Wind Down */}
                {currentMode === 'bipolar' && (
                  <div className="text-center">
                    <Moon className="w-16 h-16 mx-auto mb-4 text-headline-blue" />
                    <h2 className="font-headline text-3xl mb-4">WIND-DOWN MODE</h2>
                    <p className="font-typewriter text-lg mb-8">
                      Time to wind down for stability
                    </p>
                    
                    <div className="space-y-3 max-w-md mx-auto">
                      <p className="font-typewriter">Choose a calming activity:</p>
                      {[
                        { icon: '📖', text: 'Read something light' },
                        { icon: '🎵', text: 'Listen to calm music' },
                        { icon: '🛁', text: 'Take a warm bath' },
                        { icon: '☕', text: 'Make herbal tea' },
                      ].map((activity) => (
                        <button
                          key={activity.text}
                          onClick={() => handleMicroAct(activity.text)}
                          className="w-full classified-section hover:bg-accent-gold/10 transition-all flex items-center gap-4"
                        >
                          <span className="text-2xl">{activity.icon}</span>
                          <span className="font-typewriter">{activity.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Default Mode: Standard Micro-acts */}
                {currentMode === 'default' && (
                  <div className="text-center">
                    <h2 className="font-headline text-3xl mb-4">{t('cooldown.panelTitle')}</h2>
                    <p className="font-typewriter text-lg mb-8">{t('cooldown.cta')}</p>
                    
                    <div className="space-y-3 max-w-md mx-auto">
                      {MICRO_ACTS.map((act) => {
                        const Icon = act.icon;
                        const isCompleted = completedActs.has(act.id);
                        
                        return (
                          <motion.button
                            key={act.id}
                            onClick={() => handleMicroAct(act.id)}
                            disabled={isCompleted}
                            className={cn(
                              "w-full classified-section hover:bg-accent-gold/10 transition-all flex items-center gap-4",
                              isCompleted && "opacity-60"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon className="w-6 h-6" />
                            <span className="font-typewriter text-lg">{act.label}</span>
                            {isCompleted && <span className="ml-auto">✓</span>}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {phase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  🌟
                </motion.div>
                <h2 className="font-headline text-3xl mb-2">
                  {currentMode === 'bpd' ? 'Well done. 💙' : 'Good call!'}
                </h2>
                <p className="font-typewriter text-lg">
                  {t('toasts.cooldownOff')} +20 XP
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}