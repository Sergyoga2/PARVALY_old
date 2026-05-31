import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

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
    // CRITICAL: applyBaseStyles:false -> do NOT inject Tailwind Preflight globally.
    // The legacy /styles.css stays authoritative for base elements. See src/styles/tailwind.css.
    tailwind({ applyBaseStyles: false }),
  ],
});
