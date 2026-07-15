/* ============================================================
   T02 — Click micro-bursts + haptics, and T06 confetti.
   A single lightweight 2D canvas overlay; the RAF loop only
   runs while particles are alive.
   ============================================================ */
import { capabilities } from './capabilities';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  grav: number;
}

const COLORS = ['#7df9ff', '#3aa0ff', '#b46cff', '#eaf6ff'];

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let particles: Particle[] = [];
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
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life += 1;
    p.vy += p.grav;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.x += p.vx;
    p.y += p.vy;
    const t = p.life / p.max;
    if (t >= 1) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  raf = particles.length ? requestAnimationFrame(loop) : 0;
}

function ensureLoop(): void {
  if (!raf) raf = requestAnimationFrame(loop);
}

/** Small spark burst at a point (used on click). */
export function burstAt(x: number, y: number, count = 14): void {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = Math.random() * 3 + 1.4;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 0,
      max: 28 + Math.random() * 18,
      size: Math.random() * 2 + 1.1,
      color: COLORS[i % COLORS.length],
      grav: 0.03,
    });
  }
  ensureLoop();
}

/** Celebratory confetti burst from lower-center (used on 100% achievement). */
export function confetti(): void {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.62;
  for (let i = 0; i < 130; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = Math.random() * 7 + 3;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 6,
      life: 0,
      max: 70 + Math.random() * 45,
      size: Math.random() * 3 + 2,
      color: COLORS[i % COLORS.length],
      grav: 0.14,
    });
  }
  ensureLoop();
}

export function initBurst(): void {
  canvas = document.createElement('canvas');
  canvas.className = 'fx-burst';
  canvas.setAttribute('aria-hidden', 'true');
  const c = canvas.getContext('2d');
  if (!c) return;
  ctx = c;
  document.body.appendChild(canvas);
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener(
    'pointerdown',
    (e) => {
      burstAt(e.clientX, e.clientY);
      if (capabilities.coarsePointer) navigator.vibrate?.(8);
    },
    { passive: true }
  );
}
