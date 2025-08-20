import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';
import { useGameStore } from '../stores/gameStore';
import { ChevronRight, Phone, FileText, Shield } from 'lucide-react';
import type { CrisisContact } from '../types/behavior';

interface EnhancedOnboardingProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'mode' | 'friction' | 'safety' | 'complete';

const MODES = [
  { 
    value: 'ADHD', 
    label: 'ADHD', 
    emoji: '⚡',
    title: 'Fast wins. Real momentum.',
    description: 'Quick task capture, energetic interface, instant dopamine rewards'
  },
  { 
    value: 'BPD', 
    label: 'BPD', 
    emoji: '💙',
    title: 'Gentle structure. You are not alone.',
    description: 'Validation-focused, crisis support, non-judgmental language'
  },
  { 
    value: 'Bipolar', 
    label: 'Bipolar', 
    emoji: '🌗',
    title: 'Small, steady steps.',
    description: 'Stability focus, mood tracking, night mode, balanced approach'
  },
  { 
    value: 'Mixed', 
    label: 'Balanced', 
    emoji: '🧭',
    title: 'Balanced approach for all needs.',
    description: 'Neutral language, all features available, suitable for general use'
  },
] as const;

const FRICTIONS = [
  { value: 'overwhelm', emoji: '🌊', label: 'Overwhelm', description: "Too many things at once" },
  { value: 'low_mood', emoji: '☁️', label: 'Low Mood', description: "Hard to get started" },
  { value: 'anxiety', emoji: '⚡', label: 'Anxiety', description: "Worried about everything" },
  { value: 'racing_mind', emoji: '🌪️', label: 'Racing Mind', description: "Thoughts moving too fast" },
];

export default function EnhancedOnboarding({ onComplete }: EnhancedOnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [selectedFriction, setSelectedFriction] = useState<string>('');
  const [contacts, setContacts] = useState<CrisisContact[]>([]);
  const [safetyScript, setSafetyScript] = useState('');

  const setMode = useSettingsStore((state) => state.setMode);
  const awardXP = useGameStore((state) => state.awardXP);

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    setStep('friction');
  };

  const handleFrictionSelect = (friction: string) => {
    setSelectedFriction(friction);
    localStorage.setItem('pulse-default-friction', friction);
    setStep('safety');
  };

  const handleSafetySkip = () => {
    completeOnboarding();
  };

  const handleSafetySetup = () => {
    if (contacts.length > 0) {
      localStorage.setItem('pulse-crisis-contacts', JSON.stringify({
        contacts,
        pinProtected: false
      }));
    }
    
    if (safetyScript.trim()) {
      localStorage.setItem('pulse-safety-script', safetyScript);
    }
    
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    await setMode(selectedMode as any);
    await awardXP(50);
    localStorage.setItem('pulseOnboarded', 'true');
    preseedDailyTasks(selectedFriction);
    setStep('complete');
    setTimeout(onComplete, 2000);
  };

  const preseedDailyTasks = (friction: string) => {
    const dailyOrder = {
      overwhelm: ['admin', 'move', 'hard'],
      low_mood: ['move', 'admin', 'hard'],
      anxiety: ['move', 'hard', 'admin'],
      racing_mind: ['admin', 'move', 'hard'],
    };
    
    localStorage.setItem('pulse-daily-order', JSON.stringify(
      dailyOrder[friction as keyof typeof dailyOrder] || ['move', 'hard', 'admin']
    ));
  };

  const addContact = () => {
    const name = prompt('Contact name:');
    const phone = prompt('Phone number:');
    if (name && phone) {
      setContacts([...contacts, {
        id: Date.now().toString(),
        name,
        phone,
        relationship: prompt('Relationship (optional):') || undefined
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative z-10">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl w-full text-center"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-serif font-semibold mb-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome to Pulse
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted mb-12"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your mindful companion for daily progress
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => setStep('mode')}
                className="btn btn-primary text-lg px-8 py-3 mx-auto inline-flex items-center gap-2"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}

        {step === 'mode' && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-semibold mb-4">
                Choose Your Mode
              </h2>
              <p className="text-lg text-muted">
                We'll adapt to support you best
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODES.map((mode, index) => (
                <motion.button
                  key={mode.value}
                  onClick={() => handleModeSelect(mode.value)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-6 text-left hover:shadow-raised hover:border-accent transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl group-hover:animate-pulse">{mode.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-1">{mode.label}</h3>
                      <p className="text-accent font-medium mb-2">{mode.title}</p>
                      <p className="text-sm text-muted">{mode.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'friction' && (
          <motion.div
            key="friction"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-semibold mb-4">
                What's Your Biggest Challenge?
              </h2>
              <p className="text-lg text-muted">
                We'll focus on what matters most
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {FRICTIONS.map((friction, index) => (
                <motion.button
                  key={friction.value}
                  onClick={() => handleFrictionSelect(friction.value)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="card p-6 text-center hover:shadow-raised hover:border-accent transition-all"
                >
                  <span className="text-4xl mb-3 block">{friction.emoji}</span>
                  <h3 className="font-semibold mb-1">{friction.label}</h3>
                  <p className="text-sm text-muted">{friction.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'safety' && (
          <motion.div
            key="safety"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl w-full"
          >
            <div className="text-center mb-8">
              <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-3xl font-serif font-semibold mb-4">
                Safety Planning (Optional)
              </h2>
              <p className="text-lg text-muted">
                Set up crisis support for difficult moments
              </p>
            </div>

            <div className="card p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-accent" />
                Crisis Contacts
              </h3>
              
              {contacts.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted">{contact.phone}</p>
                      </div>
                      <button
                        onClick={() => setContacts(contacts.filter(c => c.id !== contact.id))}
                        className="text-error hover:bg-error/10 p-2 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-4">No contacts added yet</p>
              )}
              
              <button
                onClick={addContact}
                className="btn btn-secondary w-full"
              >
                Add Contact
              </button>
            </div>

            <div className="card p-6 mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Safety Script
              </h3>
              <textarea
                value={safetyScript}
                onChange={(e) => setSafetyScript(e.target.value)}
                placeholder="Write a message to yourself for difficult moments..."
                className="w-full h-32 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSafetySkip}
                className="flex-1 btn btn-ghost"
              >
                Skip for Now
              </button>
              <button
                onClick={handleSafetySetup}
                className="flex-1 btn btn-primary"
              >
                Save & Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-5xl">✨</span>
            </motion.div>
            
            <h2 className="text-3xl font-serif font-semibold mb-4">
              You're All Set!
            </h2>
            <p className="text-lg text-muted">
              +50 XP earned • Let's begin your journey
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}