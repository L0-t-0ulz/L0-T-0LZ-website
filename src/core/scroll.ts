/* ============================================================
   Smooth scroll (Lenis) + GSAP ScrollTrigger under a single RAF.
   ============================================================ */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { capabilities } from './capabilities';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initScroll(): Lenis | null {
  // Reduced motion: skip smooth scroll, but ScrollTrigger still works on native scroll.
  if (capabilities.reducedMotion) {
    ScrollTrigger.refresh();
    return null;
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  // Single RAF authority: GSAP ticker drives Lenis, Lenis drives ScrollTrigger.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time: number) => {
    lenis!.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function scrollTo(target: string | HTMLElement): void {
  if (lenis) {
    lenis.scrollTo(target, { offset: -10 });
  } else {
    const el =
      typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    el?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}

export { gsap, ScrollTrigger };
