/* ============================================================
   F7 — Holographic depth. A persistent faint CRT/scanline overlay
   + mouse/gyro tilt-parallax on [data-tilt-layer] elements so the
   page reads like a projected hologram.
   ============================================================ */
import { capabilities } from './capabilities';

export function initHolo(): void {
  // Persistent CRT overlay (very faint; flicker calmed under reduced motion).
  const overlay = document.createElement('div');
  overlay.className = 'holo-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<div class="holo-overlay__flicker"></div>';
  document.body.appendChild(overlay);

  if (capabilities.reducedMotion) return; // no parallax under reduced motion

  const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-tilt-layer]'));
  if (!layers.length) return;

  let tx = 0;
  let ty = 0; // target, -1..1
  let cx = 0;
  let cy = 0; // current

  if (!capabilities.coarsePointer) {
    window.addEventListener(
      'pointermove',
      (e) => {
        tx = (e.clientX / window.innerWidth) * 2 - 1;
        ty = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );
  } else if ('DeviceOrientationEvent' in window) {
    // Gyro on touch devices (no permission prompt here; works where allowed).
    window.addEventListener('deviceorientation', (e) => {
      tx = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 30));
      ty = Math.max(-1, Math.min(1, ((e.beta ?? 0) - 45) / 30));
    });
  }

  const tick = () => {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    for (const el of layers) {
      const depth = Number(el.dataset.tiltLayer) || 1;
      const px = (-cx * 10 * depth).toFixed(2);
      const py = (-cy * 10 * depth).toFixed(2);
      const rx = (-cy * 3 * depth).toFixed(2);
      const ry = (cx * 3 * depth).toFixed(2);
      el.style.transform = `translate3d(${px}px, ${py}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
