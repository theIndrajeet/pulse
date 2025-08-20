export type Theme = 'day' | 'night' | 'auto';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  muted: string;
  accent: string;
  accentAlt: string;
  border: string;
  borderMuted: string;
  positive: string;
  warning: string;
  calm: string;
  error: string;
}

export const themes: Record<'day' | 'night', ThemeColors> = {
  day: {
    bg: '#FAF7F2',
    surface: '#FFFCF7',
    surfaceAlt: '#F6F2EB',
    ink: '#1F1B16',
    muted: '#5F5B54',
    accent: '#6E7F71',
    accentAlt: '#9B7A5E',
    border: '#E5DED4',
    borderMuted: '#EFE9DF',
    positive: '#2E7D32',
    warning: '#B9802A',
    calm: '#3B5BDB',
    error: '#A53A3A'
  },
  night: {
    bg: '#0F1210',
    surface: '#151A17',
    surfaceAlt: '#1A201C',
    ink: '#E7EDE7',
    muted: '#B4BDB6',
    accent: '#86A38F',
    accentAlt: '#9BB4A3',
    border: '#303732',
    borderMuted: '#272D29',
    positive: '#6BBF8E',
    warning: '#C79A4B',
    calm: '#6B8CCB',
    error: '#D06C6C'
  }
};

export function applyTheme(theme: 'day' | 'night') {
  // Set data-theme attribute for CSS
  document.documentElement.setAttribute('data-theme', theme);
  
  // Store preference
  localStorage.setItem('theme', theme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themes[theme].bg);
  }
}

export function getSystemTheme(): 'day' | 'night' {
  const hour = new Date().getHours();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Night theme between 7:30 PM and 6:30 AM
  const isNightTime = hour >= 19.5 || hour < 6.5;
  
  return (prefersDark || isNightTime) ? 'night' : 'day';
}

export function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  
  if (savedTheme === 'auto' || !savedTheme) {
    applyTheme(getSystemTheme());
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === 'auto') {
        applyTheme(e.matches ? 'night' : 'day');
      }
    });
  } else {
    applyTheme(savedTheme as 'day' | 'night');
  }
}