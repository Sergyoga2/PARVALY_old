// Tailwind 3 is wired through PostCSS directly (the previous @astrojs/tailwind
// integration is deprecated and does not support Astro 6). Astro/Vite auto-loads
// this config and runs it on imported CSS, so the @tailwind directives in
// src/styles/tailwind.css get expanded. We intentionally omit `@tailwind base`
// there (no Preflight) so the legacy /styles.css stays authoritative.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
