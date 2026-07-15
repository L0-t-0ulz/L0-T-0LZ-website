/* ============================================================
   LO$T$0LZ — entry point.
   ============================================================ */
// Fonts (self-hosted via @fontsource)
import '@fontsource/chakra-petch/500.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';

// Styles
import './styles/tokens.css';
import './styles/base.css';
import './styles/hud.css';
import './styles/sections.css';

import { capabilities } from './core/capabilities';
import { initScroll, ScrollTrigger } from './core/scroll';
import { initCursor, initMagnetic } from './core/cursor';
import { revealAll } from './core/reveal';

import { buildNav } from './sections/nav';
import { buildHero } from './sections/hero';
import { buildManifesto } from './sections/manifesto';
import { buildDesignio } from './sections/designio';
import { buildCapabilities } from './sections/capabilities';
import { buildFormats } from './sections/formats';
import { buildTech } from './sections/tech';
import { buildFounder } from './sections/founder';
import { buildFooter } from './sections/footer';

const app = document.getElementById('app')!;

// --- Assemble the page ---
document.body.prepend(buildNav());

const main = document.createElement('main');
main.id = 'main';
main.append(
  buildHero(),
  buildManifesto(),
  buildDesignio(),
  buildCapabilities(),
  buildFormats(),
  buildTech(),
  buildFounder()
);
app.append(main, buildFooter());

// --- Motion / scroll / cursor ---
initScroll();
initCursor();
initMagnetic();
revealAll('.reveal');

// --- Lazy 3D after first paint ---
const idle = (cb: () => void) => {
  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (c: () => void) => void }).requestIdleCallback(cb);
  } else {
    setTimeout(cb, 200);
  }
};

function boot3D(): void {
  const heroCanvas = document.querySelector<HTMLElement>('.hero__canvas');
  const heroSection = document.querySelector<HTMLElement>('.hero');
  const stage = document.querySelector<HTMLElement>('[data-garment]');

  if (!capabilities.allow3D) {
    heroSection?.classList.add('is-fallback');
    return;
  }

  // Hero eyes
  if (heroCanvas) {
    Promise.all([import('./three/EyesScene'), import('./core/renderer')])
      .then(([{ EyesScene }, { SceneRunner }]) => {
        const scene = new EyesScene(heroCanvas);
        new SceneRunner(heroCanvas, scene);
      })
      .catch(() => heroSection?.classList.add('is-fallback'));
  }

  // DesignIO garment
  if (stage) {
    Promise.all([import('./three/GarmentScene'), import('./core/renderer')])
      .then(([{ GarmentScene }, { SceneRunner }]) => {
        const scene = new GarmentScene(stage);
        new SceneRunner(stage, scene);
        ScrollTrigger.create({
          trigger: '#designio',
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => scene.setProgress(self.progress),
        });
      })
      .catch(() => {
        /* stage keeps its static gradient fallback */
      });
  }
}

idle(boot3D);

// Refresh triggers once fonts/layout settle.
window.addEventListener('load', () => ScrollTrigger.refresh());
