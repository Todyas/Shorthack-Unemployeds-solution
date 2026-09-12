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
        // Смягчённый Sber-green — тот же оттенок, но менее "неоновый",
        // чтобы карточки на светлом фоне выглядели мягко, а не кричаще.
        sber: {
          50: '#F0FAF3', 100: '#DCF3E4', 200: '#B7E5C7', 300: '#8AD3A3',
          400: '#59BD7C', 500: '#2FA25C', 600: '#1F8347', 700: '#186838', 800: '#134F2B',
        },
        // Фиолетовый зарезервирован исключительно за элементами, которые
        // явно относятся к ИИ (анализ, рекомендованный ответ) — так цвет
        // сам по себе становится частью системы значений, а не декором.
        ai: {
          50: '#F6F4FD', 100: '#EBE5FB', 200: '#D5C9F6', 300: '#B7A2EE',
          400: '#9A7CE2', 500: '#8161D4', 600: '#6A4ABE', 700: '#543997',
        },
        ink: {
          50: '#F7F8F6', 100: '#EFF1ED', 200: '#E0E3DD', 300: '#C7CBC1',
          400: '#A6ABA0', 500: '#7B8075', 600: '#5D6256', 700: '#454A40', 800: '#2E322A', 900: '#1B1E18',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27,31,24,0.04), 0 10px 30px -14px rgba(27,31,24,0.14)',
        lift: '0 4px 10px rgba(27,31,24,0.06), 0 20px 44px -18px rgba(27,31,24,0.22)',
      },
      backgroundImage: {
        brand: 'linear-gradient(135deg, #2FA25C 0%, #59BD7C 45%, #8161D4 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
