/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1A1C27',
        'bg-secondary': '#2C2E3B',
        'brand': '#4A90E2',
        'accent': '#FF6B35',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B3C1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(74, 144, 226, 0.3)',
        'glow-accent': '0 0 20px rgba(255, 107, 53, 0.3)',
      },
      transitionDuration: {
        'default': '300ms',
      },
    },
  },
  plugins: [],
}

