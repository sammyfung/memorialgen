import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        memorial: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f4dbb3',
          300: '#ecc282',
          400: '#e3a04f',
          500: '#d9862e',
          600: '#c96d23',
          700: '#a7541f',
          800: '#864320',
          900: '#6d381f',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
