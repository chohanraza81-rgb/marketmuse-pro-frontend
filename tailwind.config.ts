import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#020202',
        card: '#0A0A0A',
        border: '#1F1F1F',
        accent: '#6366F1',
        accent2: '#8B5CF6',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        satoshi: ['Satoshi', 'sans-serif'],
      },
      backdropBlur: {
        xl: '24px',
      },
    },
  },
  plugins: [],
};
export default config;
