/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          500: '#1E88E5',
          600: '#1976D2',
          700: '#1565C0',
          900: '#0D47A1'
        },
        secondary: {
          50: '#E8F5E8',
          100: '#C8E6C9',
          500: '#43A047',
          600: '#388E3C',
          700: '#2E7D32'
        },
        accent: {
          50: '#FFF8E1',
          100: '#FFECB3',
          500: '#FFB300',
          600: '#FFA000',
          700: '#FF8F00'
        },
        background: '#F8FAFC',
        surface: '#FFFFFF'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
};