/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#FAF5EF',
        paper: '#FFFFFF',
        ink: '#1C1917',
        muted: '#78716C',
        line: '#EADDCB',
        maroon: {
          DEFAULT: '#6B1D1D',
          dark: '#4A1010',
          light: '#8B3A3A',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8C96A',
          dark: '#A8841A',
        },
        ruby: '#E11D48',
        mango: '#F59E0B',
        teal: '#0D9488',
        violet: '#7C3AED',
        sky: '#0284C7',
        leaf: '#16A34A',
        cat1: '#B91C1C',
        cat2: '#EA580C',
        cat3: '#0D9488',
        cat4: '#7C3AED',
      },
    },
  },
  plugins: [],
};
