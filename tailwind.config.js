/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkroom: {
          950: '#080a0f',
          900: '#0d1117',
          850: '#131822',
          800: '#1b2230',
          700: '#283347',
          600: '#3d4d6a',
        },
        accent: {
          gold: '#eab308',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          rose: '#f43f5e',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px -2px rgba(234, 179, 8, 0.3)' },
          '100%': { boxShadow: '0 0 25px 4px rgba(234, 179, 8, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
