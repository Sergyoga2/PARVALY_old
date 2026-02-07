import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://parvaly.com',
  base: '/blog',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
