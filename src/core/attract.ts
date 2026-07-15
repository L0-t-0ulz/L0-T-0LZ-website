/* ============================================================
   F4 — Idle ATTRACT MODE. After ~18s of no input, run a self-
   playing arcade demo: streaming telemetry, wandering eyes (via
   lz:attract), and the garment auto-cycling fabrics (via lz:fabric).
   Any input exits.
   ============================================================ */
import { capabilities } from './capabilities';
import { fabrics } from '../data/content';

const IDLE_MS = 18_000;
const TELEMETRY = [
  'OPTICS · NOMINAL',
  'XPBD CORE · STABLE',
  'DRAPE SOLVE · 0.6ms',
  'FABRIC BANK · 35 LOADED',
  'RENDER · PATH-TRACED',
  'SIGNAL · LO$T$0LZ',
];

let active = false;
let idleTimer = 0;
let cycleTimer = 0;
let fabricIdx = 0;
let ui: HTMLElement | null = null;

function buildUi(): void {
  ui = document.createElement('div');
  ui.className = 'attract-ui';
  ui.setAttribute('aria-hidden', 'true');
  ui.innerHTML = `
    <div class="attract-telemetry mono"></div>
    <div class="attract-tag mono">▶ ATTRACT MODE · move to resume</div>`;
  document.body.appendChild(ui);

  const tel = ui.querySelector('.attract-telemetry');
  let i = 0;
  const stream = () => {
    if (!active || !tel) return;
    const line = document.createElement('div');
    line.textContent = `> ${TELEMETRY[i % TELEMETRY.length]}`;
    tel.appendChild(line);
    while (tel.childElementCount > 6) tel.firstElementChild?.remove();
    i += 1;
    window.setTimeout(stream, 900);
  };
  stream();
}

function enter(): void {
  if (active) return;
  active = true;
  document.documentElement.classList.add('attract');
  document.dispatchEvent(new CustomEvent('lz:attract', { detail: { on: true } }));
  buildUi();
  cycleTimer = window.setInterval(() => {
    fabricIdx = (fabricIdx + 1) % fabrics.length;
    document.dispatchEvent(new CustomEvent<number>('lz:fabric', { detail: fabricIdx }));
  }, 3000);
}

function exit(): void {
  if (!active) return;
  active = false;
  document.documentElement.classList.remove('attract');
  document.dispatchEvent(new CustomEvent('lz:attract', { detail: { on: false } }));
  window.clearInterval(cycleTimer);
  ui?.remove();
  ui = null;
}

function resetIdle(): void {
  if (active) exit();
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(enter, IDLE_MS);
}

export function initAttract(): void {
  if (capabilities.reducedMotion) return; // no cinematic under reduced motion
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach((ev) =>
    window.addEventListener(ev, resetIdle, { passive: true })
  );
  resetIdle();
}
