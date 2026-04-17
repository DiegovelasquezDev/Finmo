/**
 * tailwind.config.js
 *
 * In Tailwind v4, the design tokens live in @theme inside index.css.
 * This file is still useful for:
 *   - darkMode strategy
 *   - content paths (safelist, etc.)
 *   - plugins
 *
 * Colors, fonts, shadows, etc. are defined in src/index.css (@theme block).
 * Runtime JS access → import from src/config/theme.js
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [],
}
