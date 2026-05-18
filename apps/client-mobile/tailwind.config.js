/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a4480',
          light: '#2563eb',
        },
        navy: '#0f2444',
        secondary: '#cbd5e1',
        success: '#437b56',
        'success-bg': '#e3fee8',
        destructive: '#dc2626',
      },
    },
  },
  plugins: [],
}
