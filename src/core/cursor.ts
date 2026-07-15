/* ============================================================
   Custom crosshair cursor + magnetic buttons.
   ============================================================ */
import { gsap } from 'gsap';
import { capabilities } from './capabilities';

export function initCursor(): void {
  if (!capabilities.allowCursor) return;

  const cursor = document.querySelector<HTMLElement>('.cursor');
  if (!cursor) return;

  document.body.classList.add('cursor-ready');

  const setX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const setY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });

  window.addEventListener(
    'pointermove',
    (e) => {
      setX(e.clientX);
      setY(e.clientY);
    },
    { passive: true }
  );

  // Grow reticle over interactive targets.
  const interactive = 'a, button, [data-cursor]';
  document.addEventListener('pointerover', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest(interactive)) cursor.classList.add('is-active');
  });
  document.addEventListener('pointerout', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest(interactive)) cursor.classList.remove('is-active');
  });

  window.addEventListener('pointerdown', () => gsap.to(cursor, { scale: 0.8, duration: 0.15 }));
  window.addEventListener('pointerup', () => gsap.to(cursor, { scale: 1, duration: 0.2 }));
}

/** Attach a magnetic pull to elements matching the selector. */
export function initMagnetic(selector = '[data-magnetic]'): void {
  if (!capabilities.allowMotion || capabilities.coarsePointer) return;

  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.35;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - (r.left + r.width / 2);
      const relY = e.clientY - (r.top + r.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}
