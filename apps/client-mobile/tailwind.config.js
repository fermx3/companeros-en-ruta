/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#dd5025',
          light: '#ec6033',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#4d71ed',
          foreground: '#ffffff',
        },
        navy: '#202456',
        accent: {
          DEFAULT: '#437b56',
          foreground: '#ffffff',
        },
        warning: '#ffe159',
        muted: {
          DEFAULT: '#f5f5f5',
          foreground: '#999999',
        },
        border: '#cccccc',
        'app-bg': '#dae3fb',
        card: '#ffffff',
        success: '#437b56',
        'success-bg': '#e3fee8',
        destructive: '#dc2626',
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      fontFamily: {
        sans: ['NunitoSans_400Regular'],
        bold: ['NunitoSans_700Bold'],
        black: ['NunitoSans_900Black'],
      },
    },
  },
  plugins: [],
}
