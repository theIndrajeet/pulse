import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Heart, Wind, Hand } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { CrisisContact } from '../types/behavior';

interface SafetyLayerProps {
  onClose: () => void;
}

export default function SafetyLayer({ onClose }: SafetyLayerProps) {
  const { currentMode } = useLanguage();
  const [activeExercise, setActiveExercise] = useState<'grounding' | 'breathing' | 'script' | null>(null);
  const [contacts, setContacts] = useState<CrisisContact[]>([]);
  const [isPinLocked, setIsPinLocked] = useState(false);

  // Load crisis contacts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pulse-crisis-contacts');
    if (stored) {
      const data = JSON.parse(stored);
      setContacts(data.contacts || []);
      setIsPinLocked(data.pinProtected || false);
    }
  }, []);

  const handleContactClick = (contact: CrisisContact) => {
    if (isPinLocked) {
      // Show PIN prompt
      const pin = prompt('Enter PIN to access contacts:');
      const storedPin = localStorage.getItem('pulse-safety-pin');
      if (pin !== storedPin) {
        alert('Incorrect PIN');
        return;
      }
    }
    
    // Open phone dialer
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="min-h-screen flex items-center justify-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-paper-bg max-w-2xl w-full shadow-2xl">
          {/* Header */}
          <div className="bg-ink-black text-paper-bg p-6">
            <div className="flex justify-between items-center">
              <h1 className="font-headline text-3xl">SUPPORT CENTER</h1>
              <button
                onClick={onClose}
                className="text-paper-bg hover:text-accent-gold text-2xl"
              >
                ✕
              </button>
            </div>
            <p className="font-typewriter text-sm mt-2">
              {currentMode === 'bpd' 
                ? "You're not alone. We're here with you. 💙"
                : "Take a moment. Support is available."
              }
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {!activeExercise ? (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Grounding Exercise */}
                  <motion.button
                    onClick={() => setActiveExercise('grounding')}
                    className="w-full news-article text-left hover:translate-y-[-2px] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <Hand className="w-8 h-8 mt-1 text-accent-gold" />
                      <div>
                        <h3 className="font-headline text-xl mb-2">GROUNDING EXERCISE</h3>
                        <p className="font-typewriter text-sm text-ink-faded">
                          5-4-3-2-1 technique to reconnect with the present
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Breathing Exercise */}
                  <motion.button
                    onClick={() => setActiveExercise('breathing')}
                    className="w-full news-article text-left hover:translate-y-[-2px] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <Wind className="w-8 h-8 mt-1 text-accent-blue" />
                      <div>
                        <h3 className="font-headline text-xl mb-2">BOX BREATHING</h3>
                        <p className="font-typewriter text-sm text-ink-faded">
                          4-4-4-4 breathing pattern to calm your nervous system
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Safety Script */}
                  <motion.button
                    onClick={() => setActiveExercise('script')}
                    className="w-full news-article text-left hover:translate-y-[-2px] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <Heart className="w-8 h-8 mt-1 text-headline-red" />
                      <div>
                        <h3 className="font-headline text-xl mb-2">SELF-TALK SCRIPT</h3>
                        <p className="font-typewriter text-sm text-ink-faded">
                          Your personalized affirmations and grounding phrases
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Crisis Contacts */}
                  {contacts.length > 0 && (
                    <div className="mt-8 pt-8 border-t-2 border-ink-black">
                      <h3 className="font-headline text-xl mb-4">CRISIS CONTACTS</h3>
                      <div className="space-y-3">
                        {contacts.map((contact) => (
                          <motion.button
                            key={contact.id}
                            onClick={() => handleContactClick(contact)}
                            className="w-full classified-section text-left hover:bg-accent-gold/10 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-headline">{contact.name}</p>
                                {contact.relationship && (
                                  <p className="font-typewriter text-sm text-ink-faded">
                                    {contact.relationship}
                                  </p>
                                )}
                              </div>
                              <Phone className="w-5 h-5 text-accent-gold" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emergency Resources */}
                  <div className="mt-8 p-4 bg-red-50 border-2 border-red-600">
                    <h4 className="font-headline text-lg mb-2">EMERGENCY RESOURCES</h4>
                    <div className="font-typewriter text-sm space-y-1">
                      <p>Crisis Line: 988 (US)</p>
                      <p>Crisis Text: Text HOME to 741741</p>
                      <p>Emergency: 911</p>
                    </div>
                  </div>
                </motion.div>
              ) : activeExercise === 'grounding' ? (
                <GroundingExercise onComplete={() => setActiveExercise(null)} />
              ) : activeExercise === 'breathing' ? (
                <BreathingExercise onComplete={() => setActiveExercise(null)} />
              ) : activeExercise === 'script' ? (
                <SafetyScript onComplete={() => setActiveExercise(null)} />
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Grounding Exercise Component
function GroundingExercise({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see' },
    { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can touch' },
    { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear' },
    { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell' },
    { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="font-headline text-3xl">GROUNDING EXERCISE</h2>
      
      {step < steps.length ? (
        <div className="text-center py-8">
          <motion.div
            key={step}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <div className="font-headline text-6xl text-accent-gold">
              {steps[step].count}
            </div>
            <h3 className="font-headline text-2xl">{steps[step].sense}</h3>
            <p className="font-typewriter text-lg">{steps[step].prompt}</p>
            
            <button
              onClick={() => setStep(step + 1)}
              className="btn-newspaper mt-8"
            >
              NEXT
            </button>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <h3 className="font-headline text-2xl mb-4">WELL DONE</h3>
          <p className="font-typewriter mb-8">
            You've reconnected with the present moment.
          </p>
          <button onClick={onComplete} className="btn-newspaper">
            RETURN
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Breathing Exercise Component
function BreathingExercise({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= 3) {
          // Move to next phase
          if (phase === 'inhale') setPhase('hold1');
          else if (phase === 'hold1') setPhase('exhale');
          else if (phase === 'exhale') setPhase('hold2');
          else {
            setPhase('inhale');
            setCycles(cycles + 1);
          }
          return 0;
        }
        return c + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, cycles]);

  const phaseText = {
    inhale: 'BREATHE IN',
    hold1: 'HOLD',
    exhale: 'BREATHE OUT',
    hold2: 'HOLD',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="font-headline text-3xl">BOX BREATHING</h2>
      
      {cycles < 4 ? (
        <div className="text-center py-8">
          <motion.div
            animate={{
              scale: phase === 'inhale' || phase === 'exhale' ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className="w-32 h-32 mx-auto mb-8 border-4 border-accent-blue flex items-center justify-center"
          >
            <span className="font-headline text-4xl">{count + 1}</span>
          </motion.div>
          
          <h3 className="font-headline text-2xl mb-2">{phaseText[phase]}</h3>
          <p className="font-typewriter">Cycle {cycles + 1} of 4</p>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <h3 className="font-headline text-2xl mb-4">COMPLETE</h3>
          <p className="font-typewriter mb-8">
            Your nervous system is calmer now.
          </p>
          <button onClick={onComplete} className="btn-newspaper">
            RETURN
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Safety Script Component
function SafetyScript({ onComplete }: { onComplete: () => void }) {
  const [script, setScript] = useState('');
  
  useEffect(() => {
    const stored = localStorage.getItem('pulse-safety-script');
    if (stored) {
      setScript(stored);
    } else {
      // Default scripts based on mode
      const mode = localStorage.getItem('pulseMode') || 'default';
      const defaultScripts = {
        bpd: "I am safe in this moment. My feelings are valid, but they will pass. I am not my emotions. I am loved and worthy of care. This feeling is temporary. I can get through this.",
        adhd: "Pause. Breathe. One thing at a time. I don't need to be perfect. Progress over perfection. I can ask for help. My brain works differently, and that's okay.",
        bipolar: "This mood will shift. I am not my mood state. I can ride this wave. My medication and routines keep me stable. I deserve compassion during all phases.",
        default: "I am safe. I am strong. I can handle this. This too shall pass. I deserve kindness and care. Help is available if I need it.",
      };
      setScript(defaultScripts[mode as keyof typeof defaultScripts] || defaultScripts.default);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="font-headline text-3xl">YOUR SAFETY SCRIPT</h2>
      
      <div className="bg-paper-aged p-6 rounded">
        <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap">
          {script}
        </p>
      </div>
      
      <div className="text-center">
        <button onClick={onComplete} className="btn-newspaper">
          RETURN
        </button>
      </div>
    </motion.div>
  );
}
