import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';

const MODES = [
  { 
    value: 'ADHD', 
    label: 'ADHD', 
    emoji: '⚡',
    title: 'Fast wins. Real momentum.',
    description: 'Quick task capture, energetic interface, instant dopamine rewards, focus timers',
    features: ['⚡ Quick capture', '🎮 Gamified rewards', '🚀 High energy UI', '⏱️ Focus blasts']
  },
  { 
    value: 'BPD', 
    label: 'BPD', 
    emoji: '💙',
    title: 'Gentle structure. You are not alone.',
    description: 'Validation-focused, crisis support, non-judgmental language, emotional tracking',
    features: ['💙 Gentle language', '🤝 Crisis support', '🌱 No pressure', '📊 Mood tracking']
  },
  { 
    value: 'Bipolar', 
    label: 'Bipolar', 
    emoji: '🌗',
    title: 'Small, steady steps.',
    description: 'Stability focus, mood tracking, night mode, balanced approach to tasks',
    features: ['🌗 Balance focus', '📈 Mood patterns', '🌙 Night mode', '⚖️ Steady pace']
  },
  { 
    value: 'Mixed', 
    label: 'Balanced', 
    emoji: '🧭',
    title: 'Balanced approach for all needs.',
    description: 'Neutral language, all features available, suitable for general use',
    features: ['🧭 All features', '📝 Neutral tone', '🎯 Flexible', '🔧 Customizable']
  },
] as const;

interface ModeSelectorProps {
  onComplete: () => void;
}

export default function ModeSelector({ onComplete }: ModeSelectorProps) {
  const setMode = useSettingsStore((state) => state.setMode);

  const handleModeSelect = async (mode: 'ADHD' | 'BPD' | 'Bipolar' | 'Mixed') => {
    await setMode(mode);
    // Mark as not first time
    localStorage.setItem('pulseOnboarded', 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-paper-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="headline-primary mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            WELCOME TO PULSE
          </motion.h1>
          <motion.p 
            className="font-serif text-2xl text-ink-faded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Let's personalize your mental health companion
          </motion.p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODES.map((mode, index) => (
            <motion.button
              key={mode.value}
              onClick={() => handleModeSelect(mode.value as any)}
              className="news-article text-left hover:translate-y-[-4px] hover:shadow-2xl transition-all"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl">{mode.emoji}</span>
                <div className="flex-1">
                  <h2 className="font-headline text-3xl mb-2">
                    {mode.label}
                  </h2>
                  <p className="font-serif text-xl mb-3 text-ink-black">
                    {mode.title}
                  </p>
                  <p className="font-typewriter text-sm text-ink-faded mb-4">
                    {mode.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {mode.features.map((feature) => (
                      <span key={feature} className="font-typewriter text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          className="text-center mt-12 font-typewriter text-sm text-ink-faded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          You can change this anytime in Settings
        </motion.p>
      </motion.div>
    </div>
  );
}
