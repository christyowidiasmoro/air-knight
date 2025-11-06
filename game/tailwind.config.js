/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        'game-ui': '1000',
      },
      colors: {
        'game-primary': '#2563eb',
        'game-secondary': '#64748b',
        'game-accent': '#10b981',
        'game-danger': '#ef4444',
        'game-warning': '#f59e0b',
      },
      fontFamily: {
        'game': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      screens: {
        'xs': '320px',
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px',
        'ultra': '1536px',
      },
    },
  },
  plugins: [],
}