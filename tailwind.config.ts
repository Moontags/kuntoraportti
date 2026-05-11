import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#f97316',
          'orange-dark': '#ea6c0a',
          'orange-light': '#fb923c',
          black: '#0a0a0a',
          dark: '#111111',
          card: '#1a1a1a',
          border: '#2d2d2d',
          muted: '#6b7280',
          light: '#9ca3af',
          white: '#f3f4f6',
        }
      },
      screens: { 'xs': '375px' }
    },
  },
  plugins: [],
};

export default config;
