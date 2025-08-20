// Retro 8-bit sound effects using Web Audio API

class RetroSoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  private createOscillator(frequency: number, type: OscillatorType = 'square'): OscillatorNode | null {
    if (!this.audioContext) return null;
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    return oscillator;
  }

  private createGain(value: number = 0.1): GainNode | null {
    if (!this.audioContext) return null;
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
    return gainNode;
  }

  // Classic 8-bit click sound
  playClick() {
    if (!this.audioContext) return;
    
    const oscillator = this.createOscillator(800);
    const gainNode = this.createGain(0.05);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.02);
    oscillator.stop(this.audioContext.currentTime + 0.02);
  }

  // Hover sound effect
  playHover() {
    if (!this.audioContext) return;
    
    const oscillator = this.createOscillator(600, 'sine');
    const gainNode = this.createGain(0.03);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  // Success/Complete sound
  playSuccess() {
    if (!this.audioContext) return;
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const oscillator = this.createOscillator(freq);
      const gainNode = this.createGain(0.05);
      
      if (!oscillator || !gainNode) return;

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      const startTime = this.audioContext!.currentTime + (i * 0.1);
      oscillator.start(startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      oscillator.stop(startTime + 0.1);
    });
  }

  // Error/Fail sound
  playError() {
    if (!this.audioContext) return;
    
    const oscillator = this.createOscillator(200);
    const gainNode = this.createGain(0.1);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    
    // Create a warbling effect
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
    
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // Powerup/Level up sound
  playPowerup() {
    if (!this.audioContext) return;
    
    const oscillator = this.createOscillator(200);
    const gainNode = this.createGain(0.05);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    
    // Sweep up
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
    oscillator.frequency.exponentialRampToValueAtTime(1600, this.audioContext.currentTime + 0.4);
    
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
    oscillator.stop(this.audioContext.currentTime + 0.4);
  }

  // Typing sound
  playType() {
    if (!this.audioContext) return;
    
    // Create noise for mechanical keyboard sound
    const bufferSize = this.audioContext.sampleRate * 0.01;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    const gainNode = this.createGain(0.02);
    
    if (!gainNode) return;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    noise.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.01);
    noise.stop(this.audioContext.currentTime + 0.01);
  }

  // Notification sound
  playNotification() {
    if (!this.audioContext) return;
    
    const notes = [440, 554.37, 440]; // A4, C#5, A4
    
    notes.forEach((freq, i) => {
      const oscillator = this.createOscillator(freq, 'sine');
      const gainNode = this.createGain(0.04);
      
      if (!oscillator || !gainNode) return;

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      const startTime = this.audioContext!.currentTime + (i * 0.15);
      oscillator.start(startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      oscillator.stop(startTime + 0.1);
    });
  }

  // Menu open sound
  playMenuOpen() {
    if (!this.audioContext) return;
    
    const oscillator = this.createOscillator(300);
    const gainNode = this.createGain(0.03);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  // Menu close sound
  playMenuClose() {
    if (!this.audioContext) return;
    
    const oscillator = this.createOscillator(600);
    const gainNode = this.createGain(0.03);
    
    if (!oscillator || !gainNode) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }
}

// Singleton instance
export const retroSounds = new RetroSoundGenerator();

// React hook for sound effects
import { useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export const useRetroSound = () => {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);

  const playSound = useCallback((soundName: keyof RetroSoundGenerator) => {
    if (!soundEnabled) return;
    
    const soundMethod = retroSounds[soundName];
    if (typeof soundMethod === 'function') {
      soundMethod.call(retroSounds);
    }
  }, [soundEnabled]);

  return {
    playClick: () => playSound('playClick' as any),
    playHover: () => playSound('playHover' as any),
    playSuccess: () => playSound('playSuccess' as any),
    playError: () => playSound('playError' as any),
    playPowerup: () => playSound('playPowerup' as any),
    playType: () => playSound('playType' as any),
    playNotification: () => playSound('playNotification' as any),
    playMenuOpen: () => playSound('playMenuOpen' as any),
    playMenuClose: () => playSound('playMenuClose' as any),
  };
};
