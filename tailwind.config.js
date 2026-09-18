/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0E7C66',
          dark: '#0A5C4C',
          light: '#14A385',
          soft: '#DEF3EB',
        },
      },
    },
  },
  plugins: [],
};
