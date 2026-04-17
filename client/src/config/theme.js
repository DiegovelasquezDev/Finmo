/**
 * Finmo — Theme Configuration
 *
 * Single source of truth for colors, typography, spacing, shadows, and
 * border-radius values. Consumed by:
 *  - tailwind.config.js  (extends the Tailwind theme)
 *  - ThemeContext         (provides runtime access via useTheme())
 *
 * Color palette convention:
 *   brand   → primary identity color (violet-purple)
 *   surface → background layers (page, card, overlay)
 *   content → text and icon tones
 *   border  → separator / divider tones
 *   status  → semantic feedback (success, warning, error, info)
 */

const theme = {
  // ─── Brand / Accent ────────────────────────────────────────────────────────
  colors: {
    brand: {
      50:  '#f5f0ff',
      100: '#ede0ff',
      200: '#d9bfff',
      300: '#bf94ff',
      400: '#a855f7',  // primary action
      500: '#9333ea',  // hover state
      600: '#7e22ce',  // pressed / active
      700: '#6b21a8',
      800: '#581c87',
      900: '#3b0764',
      950: '#1e0033',
    },

    // ─── Neutral (light mode surfaces & content) ──────────────────────────
    neutral: {
      white: '#ffffff',
      50:  '#f9f9fb',
      100: '#f3f3f7',
      200: '#e8e8ee',
      300: '#d1d1db',
      400: '#9e9eaf',
      500: '#6b6b80',
      600: '#4b4b60',
      700: '#3a3a52',
      800: '#25253a',
      900: '#16161f',
      950: '#0d0d14',
    },

    // ─── Semantic status ──────────────────────────────────────────────────
    success: {
      light: '#d1fae5',
      DEFAULT: '#10b981',
      dark:  '#065f46',
    },
    warning: {
      light: '#fef3c7',
      DEFAULT: '#f59e0b',
      dark:  '#92400e',
    },
    error: {
      light: '#fee2e2',
      DEFAULT: '#ef4444',
      dark:  '#7f1d1d',
    },
    info: {
      light: '#dbeafe',
      DEFAULT: '#3b82f6',
      dark:  '#1e3a8a',
    },
  },

  // ─── Typography ────────────────────────────────────────────────────────────
  fontFamily: {
    sans:    ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
    heading: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
    mono:    ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
  },

  fontSize: {
    xs:   ['0.75rem',  { lineHeight: '1rem' }],
    sm:   ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem',     { lineHeight: '1.5rem' }],
    lg:   ['1.125rem', { lineHeight: '1.75rem' }],
    xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
    '2xl':['1.5rem',   { lineHeight: '2rem' }],
    '3xl':['1.875rem', { lineHeight: '2.25rem' }],
    '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
    '5xl':['3rem',     { lineHeight: '1.1' }],
    '6xl':['3.75rem',  { lineHeight: '1.05' }],
    '7xl':['4.5rem',   { lineHeight: '1' }],
  },

  // ─── Spacing & Layout ──────────────────────────────────────────────────────
  maxWidth: {
    container: '1200px',
    prose:     '72ch',
  },

  // ─── Border Radius ─────────────────────────────────────────────────────────
  borderRadius: {
    none:  '0',
    sm:    '4px',
    DEFAULT:'6px',
    md:    '8px',
    lg:    '12px',
    xl:    '16px',
    '2xl': '24px',
    full:  '9999px',
  },

  // ─── Shadows ───────────────────────────────────────────────────────────────
  boxShadow: {
    sm:  '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
    DEFAULT: '0 4px 12px -2px rgb(0 0 0 / 0.10), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
    md:  '0 8px 24px -4px rgb(0 0 0 / 0.12), 0 4px 8px -2px rgb(0 0 0 / 0.06)',
    lg:  '0 16px 40px -8px rgb(0 0 0 / 0.15), 0 8px 16px -4px rgb(0 0 0 / 0.08)',
    xl:  '0 24px 60px -12px rgb(0 0 0 / 0.20)',
    glow:'0 0 24px 4px rgb(168 85 247 / 0.35)',
    none:'none',
  },

  // ─── Animation / Transition ────────────────────────────────────────────────
  transitionDuration: {
    fast:   '100ms',
    base:   '200ms',
    slow:   '350ms',
    slower: '600ms',
  },

  // ─── Dark mode semantic tokens ─────────────────────────────────────────────
  // These are referenced in the CSS custom properties block in index.css.
  // Use them to build context-aware components without hard-coding light/dark.
  semanticTokens: {
    light: {
      'bg-page':       '#f9f9fb',
      'bg-surface':    '#ffffff',
      'bg-overlay':    '#f3f3f7',
      'text-primary':  '#16161f',
      'text-secondary':'#4b4b60',
      'text-muted':    '#9e9eaf',
      'border':        '#e8e8ee',
      'border-strong': '#d1d1db',
    },
    dark: {
      'bg-page':       '#0d0d14',
      'bg-surface':    '#16161f',
      'bg-overlay':    '#25253a',
      'text-primary':  '#f3f3f7',
      'text-secondary':'#c8c8da',
      'text-muted':    '#6b6b80',
      'border':        '#25253a',
      'border-strong': '#3a3a52',
    },
  },
}

export default theme
