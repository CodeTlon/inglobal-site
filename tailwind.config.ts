import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // InGlobal Design System — Industrial Architect
        'igb-yellow': '#f5d100',
        'igb-yellow-dark': '#6f5d00',
        'igb-navy': '#1C357F',
        'igb-on-yellow': '#221b00',
        'igb-secondary': '#575d78',
        'igb-surface': '#f8f9fa',
        'igb-surface-low': '#f3f4f5',
        'igb-surface-high': '#e7e8e9',
        'igb-surface-highest': '#e1e3e4',
        'igb-on-surface': '#191c1d',
        'igb-outline': '#cfc6ab',
      },
      fontFamily: {
        headline: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'igb': '0 20px 40px rgba(10, 17, 40, 0.05)',
        'igb-lg': '0 32px 64px rgba(10, 17, 40, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
