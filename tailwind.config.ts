import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f',
        surface: '#12121a',
        elevated: '#1a1a24',
        'neon-cyan': '#00f5ff',
        'neon-pink': '#ff2d6a',
        'neon-purple': '#bf5af2',
        'text-primary': '#e4e4ed',
        'text-secondary': '#9090a0',
        'text-muted': '#6b6b7a',
        accent: '#6366f1',
        border: '#2a2a3a',
        'border-light': '#1e1e2e',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,245,255,0.4)',
        'glow-pink': '0 0 20px rgba(255,45,106,0.4)',
        'glow-purple': '0 0 20px rgba(191,90,242,0.4)',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
