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
          // Bumped from web's #999999 to #4b5563. The web uses muted-fg on
          // white (~3:1, marginal); mobile uses it on bg-app-bg (#dae3fb)
          // where #999999 drops to ~2:1 and fails WCAG AA. #4b5563 hits
          // ~6.4:1 on the blue and ~8.6:1 on white — passes AAA on both.
          foreground: '#4b5563',
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
