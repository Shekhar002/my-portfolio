// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://shekhar002.github.io/my-portfolio/
  // When a custom domain is added, set `site` to it and remove `base`.
  site: 'https://shekhar002.github.io',
  base: '/my-portfolio',
  trailingSlash: 'ignore',

  integrations: [react()],

  // Self-hosted at build time via Astro's Fonts API (no runtime request to Google/Fontsource).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'League Gothic',
      cssVariable: '--font-league-gothic',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Impact', 'Arial Narrow', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: ['100 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'Consolas', 'monospace'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
