import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useLanguage } from '../contexts/LanguageContext';
import { useBehaviorComputed } from '../behavior/BehaviorProvider';
import { Menu, X, BarChart3, Settings, Heart } from 'lucide-react';

interface HeaderProps {
  onStatsClick: () => void;
  onSettingsClick: () => void;
  onSafetyClick?: () => void;
}

export default function Header({ onStatsClick, onSettingsClick, onSafetyClick }: HeaderProps) {
  const { currentStreak, level } = useGameStore();
  const { t } = useLanguage();
  const computed = useBehaviorComputed();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (callback?: () => void) => {
    if (callback) callback();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="w-full mb-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden absolute top-4 right-4 z-40 p-2 rounded-lg bg-surface/90 backdrop-blur-sm shadow-ambient"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Minimal Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Pulse</h1>
            <p className="text-sm text-muted mt-1">{t('header.tagline')}</p>
          </div>
          
          {/* Desktop Stats & Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted uppercase tracking-wider">Streak</p>
                <p className="text-lg font-medium">{currentStreak}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted uppercase tracking-wider">Level</p>
                <p className="text-lg font-medium">{level}</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="flex items-center gap-1">
              <button
                onClick={onStatsClick}
                className="p-2.5 rounded-lg hover:bg-surface-alt transition-colors"
                aria-label="Statistics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              
              {computed.showCrisisButton && onSafetyClick && (
                <button
                  onClick={onSafetyClick}
                  className="p-2.5 rounded-lg hover:bg-surface-alt transition-colors text-error"
                  aria-label="Support"
                >
                  <Heart className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onSettingsClick}
                className="p-2.5 rounded-lg hover:bg-surface-alt transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subtle separator */}
        <hr className="separator-dotted mt-6" />
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed right-0 top-0 h-full w-72 bg-surface shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Close button */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Menu Title */}
                <h2 className="text-xl font-semibold mb-8 mt-2">Menu</h2>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="card p-4 text-center">
                    <p className="text-xs text-muted uppercase tracking-wider">Streak</p>
                    <p className="text-lg font-medium mt-1">{currentStreak}</p>
                  </div>
                  <div className="card p-4 text-center">
                    <p className="text-xs text-muted uppercase tracking-wider">Level</p>
                    <p className="text-lg font-medium mt-1">{level}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2">
                  <button
                    onClick={() => handleNavClick(onStatsClick)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-alt transition-colors text-left"
                  >
                    <BarChart3 className="w-5 h-5 text-muted" />
                    <span className="font-medium">View Statistics</span>
                  </button>

                  {computed.showCrisisButton && onSafetyClick && (
                    <button
                      onClick={() => handleNavClick(onSafetyClick)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-error/10 hover:bg-error/20 transition-colors text-error text-left"
                    >
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">Get Support</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleNavClick(onSettingsClick)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-alt transition-colors text-left"
                  >
                    <Settings className="w-5 h-5 text-muted" />
                    <span className="font-medium">Settings</span>
                  </button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}