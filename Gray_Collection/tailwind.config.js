

/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e8f0e8',
          200: '#cddbcd',
          300: '#a3bfa3',
          400: '#759c75',
          500: '#527d52',
          600: '#3d613d',
          700: '#334e33',
          800: '#2a3e2a',
          900: '#233323',
        },
        mint: {
          50: '#f0faf8',
          100: '#d4f1ec',
          200: '#b2e6de',
          300: '#a0ddd4',
          400: '#7ecfc3',
          500: '#5bbfb1',
          600: '#42a396',
          700: '#358478',
          800: '#2b6a61',
          900: '#23564f',
        },
        gold: {
          50: '#fdfaf3',
          100: '#f9f0d9',
          200: '#f2e0b0',
          300: '#e8cc7e',
          400: '#ddb54e',
          500: '#d4a033',
          600: '#b88326',
          700: '#996621',
          800: '#7d5220',
          900: '#67441e',
        },
        rose: {
          50: '#fdf5f5',
          100: '#fce8e8',
          200: '#f9d4d4',
          300: '#f3b0b0',
          400: '#ea8080',
          500: '#dc5656',
          600: '#c83c3c',
          700: '#a82e2e',
          800: '#8b2929',
          900: '#742828',
        },
        brand: {
          dark: '#1A1A1A',
          gray: '#4A4A4A',
          light: '#F9F9F9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      letterSpacing: {
        widest: '.1em',
      }
    },
  },
  plugins: [],
}

