/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f172a',
        sidebar: '#080d18',
        panel: '#1e293b',
        border: '#334155',
        'text-primary': '#f8fafc',
        'text-muted': '#94a3b8',
        'accent-red': '#ef4444',
        'accent-gold': '#f59e0b',
        'success': '#22c55e',
        'info': '#3b82f6',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
}
