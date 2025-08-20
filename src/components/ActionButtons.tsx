import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
// import { useLanguage } from '../contexts/LanguageContext';
// import { useBehaviorComputed } from '../behavior/BehaviorProvider';

export default function ActionButtons() {
  const [focusTime, setFocusTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  
  const gainXP = useGameStore((state) => state.gainXP);
  // const { t } = useLanguage();
  // const computed = useBehaviorComputed();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        if (isBreak) {
          setBreakTime((prev) => {
            if (prev <= 0) {
              setIsBreak(false);
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setFocusTime((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    if (!isRunning && focusTime > 0) {
      // Starting after pause - no XP
      setIsRunning(true);
    } else if (!isRunning) {
      // Fresh start
      setIsRunning(true);
      setFocusTime(0);
    } else {
      // Pausing
      setIsRunning(false);
      if (focusTime >= 60) {
        const xpEarned = Math.floor(focusTime / 60) * 10;
        gainXP(xpEarned);
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setFocusTime(0);
    setBreakTime(0);
    setIsBreak(false);
  };

  const handleBreak = () => {
    setIsBreak(true);
    setBreakTime(5 * 60); // 5 minute break
    setIsRunning(true);
  };

  return (
    <section className="mb-8">
      <h2 className="section-title">Focus</h2>
      
      <div className="card p-8 text-center">
        {/* Timer Display */}
        <div className="mb-8">
          <motion.h3 
            key={isBreak ? 'break' : 'focus'}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-serif text-5xl md:text-6xl font-semibold tabular-nums"
          >
            {isBreak ? formatTime(breakTime) : formatTime(focusTime)}
          </motion.h3>
          <motion.p 
            className="text-sm text-muted mt-2"
            animate={{ opacity: isRunning ? [1, 0.7, 1] : 1 }}
            transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
          >
            {isBreak ? 'Break Time' : isRunning ? 'Focusing...' : 'Ready to focus?'}
          </motion.p>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleToggle}
            disabled={isBreak}
            className="btn btn-primary flex items-center gap-2"
          >
            {isRunning && !isBreak ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="btn btn-secondary"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {!isBreak && focusTime > 0 && !isRunning && (
            <button
              onClick={handleBreak}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              <span>Break</span>
            </button>
          )}
        </div>

        {/* XP Indicator */}
        {focusTime > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-sm text-muted"
          >
            {Math.floor(focusTime / 60)} min = {Math.floor(focusTime / 60) * 10} XP
          </motion.div>
        )}
      </div>
      
      {/* Subtle separator */}
      <hr className="separator-dotted" />
    </section>
  );
}