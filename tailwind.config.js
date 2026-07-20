/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        narad: {
          bg: '#050B18',
          surface: '#0B1424',
          card: '#101D33',
          border: '#1C2D4A',
          primary: '#00E5FF',
          primaryDim: '#00A8B8',
          accent: '#FFB800',
          danger: '#FF3B5C',
          success: '#00E676',
          warning: '#FFB800',
          text: '#E8F0FF',
          muted: '#6B7B95',
          glow: 'rgba(0, 229, 255, 0.4)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Inter', 'sans-serif'],
        deva: ['Tiro Devanagari Hindi', 'Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan-line': 'scanLine 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)' }, '50%': { boxShadow: '0 0 40px rgba(0, 229, 255, 0.6)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        scanLine: { '0%': { top: '0%' }, '50%': { top: '100%' }, '100%': { top: '0%' } },
      },
    },
  },
  plugins: [],
};
