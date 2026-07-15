import { defineConfig } from 'vite';

// `process` exists at runtime (Vite config runs in Node); declare it for tsc
// so we don't need to pull in @types/node just for the config.
declare const process: { env: Record<string, string | undefined> };

// GitHub Pages serves this project repo under /L0-T-0LZ-website/.
// Locally (dev / preview) we serve from root. CI sets GITHUB_ACTIONS=true.
const base = process.env.GITHUB_ACTIONS ? '/L0-T-0LZ-website/' : '/';

// Shaders are imported with Vite's built-in `?raw` suffix — no plugin needed.
export default defineConfig({
  base,
  build: {
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          postprocessing: ['postprocessing'],
          gsap: ['gsap'],
        },
      },
    },
  },
});
