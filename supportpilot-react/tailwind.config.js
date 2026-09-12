/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Manrope', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        sber: { 50: '#EAF8EE', 100: '#CFF0D9', 200: '#9FE0B4', 400: '#3CB55E', 500: '#19A84A', 600: '#128A3B', 700: '#0D6B2E' },
        ai:   { 50: '#F2EFFC', 100: '#E2DBFA', 300: '#B6A6F0', 500: '#7C5CE0', 600: '#6544C4', 700: '#4F349C' },
        ink:  { 50: '#F7F8F7', 100: '#EEF0EE', 200: '#DEE2DE', 300: '#C4C9C4', 500: '#7A827D', 700: '#3F453F', 900: '#1B1F1C' },
      },
      boxShadow: { card: '0 1px 2px rgba(27,31,28,0.04), 0 1px 8px rgba(27,31,28,0.05)' },
    },
  },
  plugins: [],
}
