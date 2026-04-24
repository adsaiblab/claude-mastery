import starlightPlugin from '@astrojs/starlight-tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f6ef7',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1a1f2e',
        },
        gray: {
          1: '#e2e8f0',
          2: '#94a3b8',
          3: '#475569',
          4: '#334155',
          5: '#1e293b',
          6: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [starlightPlugin()],
};
