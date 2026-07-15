# LO$T$0LZ — website

Marketing site for **LO$T$0LZ** (a.k.a. L0-t-0ulz) — forging the future of fashion, in 3D. Flagship: **DesignIO**.

**Live:** https://lostsoulz.vercel.app

A dark, futuristic single-page site built around the signature eye theme — cursor-tracking WebGL eyes, a procedural drag-to-spin garment with live fabric swatching, scroll-warp motion, an audio-reactive ambient layer, a real "◉ N exploring now" presence counter, a live DesignIO waitlist, and a hidden ARG (Konami INTRUDER mode · backtick terminal · fragment hunt → VAULT).

## Stack
Vanilla **Vite + TypeScript (strict) + Three.js** · GSAP + Lenis · pmndrs `postprocessing` (bloom) · node-redis serverless functions (`api/`) · deployed on Vercel.

## Develop
```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # tsc --noEmit && vite build
npm run preview    # serve the production build
```

## Deploy
Production is deployed via the Vercel CLI (`npx vercel --prod`). Every PR to `main` gets an automatic **preview deployment** posted as a comment (see `.github/workflows/preview.yml`).

---
Proprietary · all rights reserved · © 2026 L0-t-0ulz · Zayan Khan
