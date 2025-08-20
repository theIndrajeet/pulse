/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paper-bg': '#f4f1e8',
        'paper-aged': '#ebe5d6',
        'ink-black': '#1a1a1a',
        'ink-faded': '#3a3a3a',
        'ink-light': '#6a6a6a',
        'headline-red': '#8b0000',
        'accent-gold': '#d4a574',
        'border-dark': '#2a2a2a',
        'shadow-brown': 'rgba(139, 69, 19, 0.1)',
        // Keep old colors for compatibility
        'pulse-dark': '#0E1726',
        'pulse-darker': '#0A111C',
        'pulse-secondary': '#1A2332',
        'pulse-teal': '#7CDBD5',
        'pulse-teal-dark': '#2D4F4C',
        'pulse-amber': '#F59E0B',
        'pulse-amber-dark': '#B45309',
        'pulse-success': '#22C55E',
        'pulse-error': '#EF4444',
      },
      fontFamily: {
        'headline': ['Bebas Neue', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
        'typewriter': ['Courier Prime', 'monospace'],
        'slab': ['Roboto Slab', 'serif'],
        sans: ['Roboto Slab', 'serif'],
      },
      animation: {
        'paper-fold': 'paperFold 4s ease-in-out infinite',
        'print-press': 'printPress 0.5s ease-out',
        'typewriter': 'typewriter 2s steps(40) 1s forwards',
        'scroll-text': 'scrollText 10s linear infinite',
        'stamp-rotate': 'stampRotate 0.3s ease-out',
      },
      keyframes: {
        paperFold: {
          '0%': { transform: 'translateX(0) rotateY(0)' },
          '50%': { transform: 'translateX(2px) rotateY(0.5deg)' },
          '100%': { transform: 'translateX(0) rotateY(0)' },
        },
        printPress: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        typewriter: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        scrollText: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        stampRotate: {
          '0%': { transform: 'rotate(-5deg) scale(1.2)' },
          '100%': { transform: 'rotate(-5deg) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
