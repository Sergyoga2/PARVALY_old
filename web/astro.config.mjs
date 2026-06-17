import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// PARVALY marketing site — pilot (homepage only).
// Outputs a single root index.html so parvaly.com/ serves this page,
// while all other legacy .html files remain untouched in the same docroot.
export default defineConfig({
  site: 'https://parvaly.com',
  // No `base` -> served from root "/". (The blog uses base:'/blog' in astro-blog/.)
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // Emit /index.html (not /index/index.html) to match the existing docroot layout.
    format: 'file',
  },
  integrations: [
    react(),
  ],
  // Tailwind 3 is processed via PostCSS (see postcss.config.mjs) instead of the
  // deprecated @astrojs/tailwind integration (incompatible with Astro 6).
  // No Preflight: src/styles/tailwind.css omits `@tailwind base`, and
  // tailwind.config sets corePlugins.preflight:false — the legacy /styles.css
  // stays authoritative for base elements.
});
