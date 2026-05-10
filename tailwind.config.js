/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'quran-green': {
          50: '#f0f9f1',
          700: '#2d6a4f',
          900: '#1b4332',
        },
      },
      fontFamily: {
        'uthmanic': ['UthmanicHafs', 'serif'],
        'amiri': ['Amiri', 'serif'],
      },
    },
  },
  plugins: [],
}