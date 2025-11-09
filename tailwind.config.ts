// tailwind.config.ts
import { type Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Roboto Mono', 'monospace'],
      },
      colors: {
        'bg-app': '#F7F8FA',
        'card-bg': '#FFFFFF',
        'muted': '#6B7280',
        'border-100': '#E6E9EE',
        'accent-green': '#16A34A',
        'accent-red': '#EF4444',
      },
      boxShadow: {
        'card-sm': '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 4px rgba(2, 6, 23, 0.04)',
        'card-md': '0 6px 18px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      spacing: {
        4.5: '1.125rem',
      },
      lineHeight: {
        tight: '1.15',
      },
      maxWidth: {
        page: '1060px',
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
