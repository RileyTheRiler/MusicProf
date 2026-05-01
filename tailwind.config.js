/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          950: '#0a0a0c',
          900: '#111114',
          800: '#1a1a20',
          700: '#24242c',
          600: '#2f2f38',
        },
        accent: {
          amber: '#f59e0b',
          red: '#ef4444',
          cyan: '#22d3ee',
          violet: '#a78bfa',
          green: '#10b981',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
