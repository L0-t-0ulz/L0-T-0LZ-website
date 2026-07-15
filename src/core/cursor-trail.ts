/* ============================================================
   F2 — Comet cursor trail. A faint additive wake following the
   pointer. Fine-pointer + motion only; loop idles when nothing
   is moving.
   ============================================================ */
import { capabilities } from './capabilities';

interface Point {
  x: number;
  y: number;
  t: number;
}

const LIFE = 420; // ms

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let points: Point[] = [];
let raf = 0;

function resize(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function loop(): void {
  const now = performance.now();
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.globalCompositeOperation = 'lighter';
  points = points.filter((p) => now - p.t < LIFE);
  for (const p of points) {
    const k = 1 - (now - p.t) / LIFE;
    ctx.fillStyle = `rgba(125, 249, 255, ${(k * 0.5).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1 + k * 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  raf = points.length ? requestAnimationFrame(loop) : 0;
}

export function initCursorTrail(): void {
  if (!capabilities.allowCursor) return; // fine-pointer + non-reduced-motion only

  canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail';
  canvas.setAttribute('aria-hidden', 'true');
  const c = canvas.getContext('2d');
  if (!c) return;
  ctx = c;
  document.body.appendChild(canvas);
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (points.length > 60) points.shift();
      if (!raf) raf = requestAnimationFrame(loop);
    },
    { passive: true }
  );
}
