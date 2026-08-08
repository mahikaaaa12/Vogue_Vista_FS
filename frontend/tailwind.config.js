/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./NEW_UI_Body/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lux: {
          bg: {
            primary: 'var(--bg-primary)',
            secondary: 'var(--bg-secondary)',
            tertiary: 'var(--bg-tertiary)',
          },
          text: {
            primary: 'var(--text-primary)',
            secondary: 'var(--text-secondary)',
            muted: 'var(--text-muted)',
          },
          gold: {
            DEFAULT: 'var(--accent-gold)',
            dark: 'var(--accent-gold-dark)',
            light: 'var(--accent-gold-light)',
          },
          border: {
            light: 'var(--border-light)',
            medium: 'var(--border-medium)',
          },
        }
      },
      fontFamily: {
        editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        accent: ['var(--font-accent)', 'sans-serif'],
      },
      transitionTimingFunction: {
        lux: 'var(--transition-lux)',
        fast: 'var(--transition-fast)',
      },
      boxShadow: {
        premium: 'var(--shadow-premium)',
        'premium-hover': 'var(--shadow-premium-hover)',
      }
    },
  },
  plugins: [],
}
