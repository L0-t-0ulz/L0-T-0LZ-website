/* ============================================================
   F3 — Scroll-warp. Scroll velocity drives a 0..1 "energy" that
   ramps a chromatic/scanline overlay + the hero bloom, and each
   section does a one-shot scan wipe on first enter.
   ============================================================ */
import { capabilities } from './capabilities';
import { ScrollTrigger } from './scroll';

let energy = 0; // smoothed 0..1
let rawVel = 0; // px per ms
let lastY = 0;
let lastT = 0;

/** Current scroll energy, 0..1 (0 under reduced motion). */
export function scrollEnergy(): number {
  return energy;
}

export function initWarp(): void {
  if (capabilities.reducedMotion) return; // calm: energy stays 0

  lastY = window.scrollY;
  lastT = performance.now();

  const overlay = document.createElement('div');
  overlay.className = 'warp-fx';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<div class="warp-fx__scan"></div>';
  document.body.appendChild(overlay);

  window.addEventListener(
    'scroll',
    () => {
      const now = performance.now();
      const dt = Math.max(16, now - lastT);
      rawVel = Math.abs(window.scrollY - lastY) / dt;
      lastY = window.scrollY;
      lastT = now;
    },
    { passive: true }
  );

  const tick = () => {
    const target = Math.min(1, rawVel / 3); // ~3px/ms reads as "fast"
    energy += (target - energy) * 0.12;
    rawVel *= 0.9;
    overlay.style.setProperty('--warp', energy.toFixed(3));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // One-shot scan wipe per section as it first enters.
  document.querySelectorAll<HTMLElement>('#main > section').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 82%',
      once: true,
      onEnter: () => section.classList.add('scan-in'),
    });
  });
}
