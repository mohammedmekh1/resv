/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        kaaba: {
          50:  '#fdf8f0',
          100: '#f9edcf',
          200: '#f3d99a',
          300: '#ebc05c',
          400: '#e3a82a',
          500: '#c48917',
          600: '#9a6712',
          700: '#7a500f',
          800: '#5c3c0c',
          900: '#3d2808',
        },
        haram: {
          50:  '#f0f4f8',
          100: '#d9e4ef',
          200: '#afc5de',
          300: '#7da0c9',
          400: '#4d7db5',
          500: '#2d5f9a',
          600: '#1e4a7d',
          700: '#153a63',
          800: '#0e2a48',
          900: '#071b30',
        },
        pearl: '#f8f4ef',
        gold:  '#d4a843',
        emerald: '#1a6b4a',
      },
      backgroundImage: {
        'geometric': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a843' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'slide-right': 'slideRight 0.4s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 168, 67, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 168, 67, 0)' },
        },
      },
    },
  },
  plugins: [],
}
