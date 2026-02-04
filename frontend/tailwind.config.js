/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Airbnb-inspired color palette
        primary: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFC9C9',
          300: '#FFA5A5',
          400: '#FF8585',
          500: '#FF6565',
          600: '#FF385C', // Primary color
          700: '#E22C4C',
          800: '#C91F3B',
          900: '#A00A20',
        },
        secondary: {
          50: '#E5F9F6',
          100: '#C5F2EE',
          200: '#A3ECE6',
          300: '#81E5DE',
          400: '#5FDDD6',
          500: '#3DC5CE',
          600: '#008489', // Secondary color
          700: '#00696C',
          800: '#004D4F',
          900: '#003233',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E5E5E5',
          400: '#DDDDDD',
          500: '#D4D4D4',
          600: '#717171',
          700: '#4B4B4B',
          800: '#303030',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}