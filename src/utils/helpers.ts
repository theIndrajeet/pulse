import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function getTodayDate(): string {
  return formatDate(new Date());
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

export function getMoodEmoji(mood: number): string {
  const moods: Record<number, string> = {
    '-2': '😔',
    '-1': '😕',
    '0': '😐',
    '1': '🙂',
    '2': '😄'
  };
  return moods[mood] || '😐';
}

export function playSound(type: 'complete' | 'levelup' | 'cooldown') {
  // This will be implemented later with actual sound files
  // For now, we'll use the Web Audio API for simple sounds
  if (!window.AudioContext) return;
  
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  const frequencies = {
    complete: 523.25, // C5
    levelup: 659.25,  // E5
    cooldown: 440     // A4
  };
  
  oscillator.frequency.value = frequencies[type];
  gainNode.gain.setValueAtTime(0.3, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
  
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.3);
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    navigator.vibrate(patterns[type]);
  }
}
