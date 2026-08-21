/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070a12',
          900: '#0b0f19',
          850: '#0f1424',
          800: '#141a2e',
          700: '#1c2440',
          600: '#27314f',
        },
        cyber: {
          50: '#e6feff',
          100: '#ccfdff',
          200: '#99fbff',
          300: '#5ff6ff',
          400: '#00f2fe',
          500: '#00d4e6',
          600: '#00a8b8',
          700: '#007a85',
        },
        warn: {
          400: '#ffb86b',
          500: '#ff9f43',
          600: '#e68a2e',
        },
        alarm: {
          400: '#ff7575',
          500: '#ff5252',
          600: '#e23b3b',
        },
        quantum: {
          300: '#c084f5',
          400: '#a55eea',
          500: '#8a4bd4',
          600: '#6f2eb8',
        },
        finance: {
          400: '#54e08a',
          500: '#2ecc71',
          600: '#25b461',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0,242,254,0.35)',
        'glow-warn': '0 0 24px rgba(255,159,67,0.35)',
        'glow-alarm': '0 0 24px rgba(255,82,82,0.4)',
        'glow-quantum': '0 0 28px rgba(165,94,234,0.4)',
        'glow-finance': '0 0 20px rgba(46,204,113,0.35)',
        glass: '0 8px 32px rgba(0,0,0,0.37)',
      },
      backgroundImage: {
        'grid-cyber': 'linear-gradient(rgba(0,242,254,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        flowDash: {
          to: { strokeDashoffset: '-40' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'flow-dash': 'flowDash 1.5s linear infinite',
        sweep: 'sweep 2.5s ease-in-out infinite',
        flicker: 'flicker 1.8s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        scan: 'scan 3s linear infinite',
      },
    },
  },
  plugins: [],
};
