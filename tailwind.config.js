/** Tailwind maps onto the CSS custom properties in css/design-tokens.css,
 *  so utilities and hand-written components always share one palette. */
module.exports = {
  content: ['./index.html', './pages/**/*.html', './js/**/*.js'],
  theme: {
    container: { center: true },
    extend: {
      fontFamily: { sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: 'var(--color-primary)', hover: 'var(--color-primary-hover)', soft: 'var(--color-primary-soft)' },
        ink: { DEFAULT: 'var(--color-text)', 2: 'var(--color-text-secondary)', muted: 'var(--color-text-muted)' },
        bg: { DEFAULT: 'var(--color-bg)', alt: 'var(--color-bg-alt)' },
        surface: { DEFAULT: 'var(--color-surface)', sunken: 'var(--color-surface-sunken)' },
        line: { DEFAULT: 'var(--color-border)', strong: 'var(--color-border-strong)' },
        success: { DEFAULT: 'var(--color-success)', soft: 'var(--color-success-soft)' },
        warning: { DEFAULT: 'var(--color-warning)', soft: 'var(--color-warning-soft)' },
        danger: { DEFAULT: 'var(--color-error)', soft: 'var(--color-error-soft)' },
      },
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', xl: 'var(--radius-xl)' },
      boxShadow: { 1: 'var(--shadow-1)', 2: 'var(--shadow-2)', 3: 'var(--shadow-3)' },
      maxWidth: { container: 'var(--container-max)', prose: '68ch' },
    },
  },
  plugins: [],
};
