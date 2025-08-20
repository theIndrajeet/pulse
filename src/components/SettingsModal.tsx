import { motion } from 'framer-motion';
import { useState } from 'react';
import { X, Download, Upload, Moon, Sun, Zap } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { db } from '../db';
// import { useLanguage } from '../contexts/LanguageContext';
import { applyTheme, type Theme } from '../theme/theme';
// import { useBehavior } from '../behavior/BehaviorProvider';

interface SettingsModalProps {
  onClose: () => void;
}

const MODES = [
  { value: 'ADHD', label: 'ADHD', description: 'Fast wins. Real momentum.', emoji: '⚡' },
  { value: 'BPD', label: 'BPD', description: 'Gentle structure. You are not alone.', emoji: '💙' },
  { value: 'Bipolar', label: 'Bipolar', description: 'Small, steady steps.', emoji: '🌗' },
  { value: 'Mixed', label: 'Balanced', description: 'Balanced approach for all needs.', emoji: '🧭' },
] as const;

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    mode,
    reduceMotion,
    soundEnabled,
    hapticsEnabled,
    setMode,
    toggleMotion,
    toggleSound,
    updateSettings,
  } = useSettingsStore();
  
  // const { t } = useLanguage();
  // const { computed } = useBehavior();
  const [activeTheme, setActiveTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'auto'
  );

  const handleThemeChange = (theme: Theme) => {
    setActiveTheme(theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'auto') {
      // Let the system decide
      const hour = new Date().getHours();
      const isNightTime = hour >= 19.5 || hour < 6.5;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme((prefersDark || isNightTime) ? 'night' : 'day');
    } else {
      applyTheme(theme as 'day' | 'night');
    }
  };

  const handleExport = async () => {
    const data = {
      tasks: await db.tasks.toArray(),
      days: await db.days.toArray(),
      settings: await db.settings.toArray(),
      gameState: await db.gameState.toArray(),
      rituals: await db.rituals.toArray(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Clear existing data
        await db.tasks.clear();
        await db.days.clear();
        await db.rituals.clear();
        
        // Import new data
        if (data.tasks) await db.tasks.bulkAdd(data.tasks);
        if (data.days) await db.days.bulkAdd(data.days);
        if (data.settings?.[0]) await db.settings.put(data.settings[0]);
        if (data.gameState?.[0]) await db.gameState.put(data.gameState[0]);
        if (data.rituals) await db.rituals.bulkPut(data.rituals);
        
        // Reload the app
        window.location.reload();
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data. Please check the file format.');
      }
    };
    input.click();
  };

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
        className="bg-surface max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Behavior Mode */}
          <section>
            <h3 className="section-title text-lg mb-4">Behavior Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MODES.map((modeOption) => (
                <button
                  key={modeOption.value}
                  onClick={() => setMode(modeOption.value as any)}
                  className={`card p-4 text-left transition-all hover:shadow-raised ${
                    mode === modeOption.value
                      ? 'border-accent shadow-raised'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{modeOption.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{modeOption.label}</h4>
                      <p className="text-sm text-muted">{modeOption.description}</p>
                    </div>
                    {mode === modeOption.value && (
                      <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Theme Selection */}
          <section>
            <h3 className="section-title text-lg mb-4">Theme</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange('day')}
                className={`flex-1 card p-4 text-center transition-all ${
                  activeTheme === 'day' ? 'border-accent shadow-raised' : ''
                }`}
              >
                <Sun className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="font-medium">Day</p>
                <p className="text-xs text-muted mt-1">Vintage Ivory</p>
              </button>
              
              <button
                onClick={() => handleThemeChange('night')}
                className={`flex-1 card p-4 text-center transition-all ${
                  activeTheme === 'night' ? 'border-accent shadow-raised' : ''
                }`}
              >
                <Moon className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="font-medium">Night</p>
                <p className="text-xs text-muted mt-1">Tea & Graphite</p>
              </button>
              
              <button
                onClick={() => handleThemeChange('auto')}
                className={`flex-1 card p-4 text-center transition-all ${
                  activeTheme === 'auto' ? 'border-accent shadow-raised' : ''
                }`}
              >
                <Zap className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="font-medium">Auto</p>
                <p className="text-xs text-muted mt-1">System + Time</p>
              </button>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <h3 className="section-title text-lg mb-4">Preferences</h3>
            <div className="space-y-3">
              <label className="card p-4 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium">Reduce Motion</p>
                  <p className="text-sm text-muted">Minimize animations</p>
                </div>
                <button
                  onClick={toggleMotion}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    reduceMotion ? 'bg-accent' : 'bg-border'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      reduceMotion ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>

              <label className="card p-4 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-muted">Completion sounds</p>
                </div>
                <button
                  onClick={toggleSound}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    soundEnabled ? 'bg-accent' : 'bg-border'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>

              <label className="card p-4 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium">Haptic Feedback</p>
                  <p className="text-sm text-muted">Vibration on actions</p>
                </div>
                <button
                  onClick={() => updateSettings({ hapticsEnabled: !hapticsEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    hapticsEnabled ? 'bg-accent' : 'bg-border'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      hapticsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>
            </div>
          </section>

          {/* Data Management */}
          <section>
            <h3 className="section-title text-lg mb-4">Data Management</h3>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              
              <button
                onClick={handleImport}
                className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import Data</span>
              </button>
            </div>
          </section>

          {/* About */}
          <section className="text-center text-sm text-muted border-t border-border-muted pt-6">
            <p>Pulse · Your mental health companion</p>
            <p className="mt-1">Made with care for the neurodivergent community</p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}