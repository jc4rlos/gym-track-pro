import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/components/**/*.{ts,tsx}',
    './src/index.ts',
    './.storybook/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'oklch(0.527 0.154 150.069)',
          foreground: 'hsl(0 0% 100%)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
