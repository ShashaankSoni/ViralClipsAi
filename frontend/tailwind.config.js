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
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          violet: '#8b5cf6',
          purple: '#a855f7',
          neon: '#06b6d4',
          yellow: '#facc15'
        },
        dark: {
          950: '#07090e',
          900: '#0c0f17',
          850: '#111622',
          800: '#171e2e',
          700: '#232d42'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Impact', 'Arial Black', 'Montserrat', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'sub-bounce': 'subBounce 0.3s ease-out'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' }
        },
        subBounce: {
          '0%': { transform: 'scale(0.92)' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
