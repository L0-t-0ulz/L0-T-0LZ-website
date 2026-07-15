/* ============================================================
   T26 — INTRUDER mode. Trigger with the Konami code or by
   triple-clicking the nav eye glyph. Eyes turn red, the HUD
   glitches, the garment goes CLASSIFIED, a trophy drops, and a
   hunt fragment is recovered. Esc to restore.
   ============================================================ */
import { toast } from './toast';
import { confetti } from './burst';
import { audio } from './audio';
import { foundFragment } from './hunt';

type Mood = 'normal' | 'intruder';

let mood: Mood = 'normal';
let fxEl: HTMLElement | null = null;

export function getMood(): Mood {
  return mood;
}

function setMode(next: Mood): void {
  if (mood === next) return;
  mood = next;
  document.documentElement.classList.toggle('intruder', next === 'intruder');
  document.dispatchEvent(new CustomEvent('lz:mood', { detail: { mode: next } }));
  if (next === 'intruder') showFx();
  else hideFx();
}

function showFx(): void {
  if (fxEl) return;
  fxEl = document.createElement('div');
  fxEl.className = 'intruder-fx';
  fxEl.innerHTML = `
    <div class="intruder-scan" aria-hidden="true"></div>
    <div class="intruder-banner mono">
      ⚠ INTRUDER MODE // OPTICS COMPROMISED
      <button class="intruder-exit mono" type="button">ESC to restore</button>
    </div>`;
  document.body.appendChild(fxEl);
  fxEl.querySelector('.intruder-exit')?.addEventListener('click', () => setMode('normal'));
}
function hideFx(): void {
  fxEl?.remove();
  fxEl = null;
}

export function triggerIntruder(): void {
  if (mood === 'intruder') return;
  setMode('intruder');
  audio.whoosh();
  confetti();
  toast({
    icon: '🚨',
    title: 'INTRUDER DETECTED',
    body: 'You tripped the optics. Fragment recovered.',
  });
  foundFragment('intruder');
}

export function restore(): void {
  setMode('normal');
}

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];
let seq: string[] = [];

export function initIntruder(): void {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && mood === 'intruder') {
      setMode('normal');
      return;
    }
    seq.push(e.code);
    if (seq.length > KONAMI.length) seq.shift();
    if (seq.length === KONAMI.length && KONAMI.every((c, i) => seq[i] === c)) {
      seq = [];
      triggerIntruder();
    }
  });

  // Triple-click the nav eye glyph.
  const glyph = document.querySelector('.nav__brand .glyph');
  if (glyph) {
    let clicks = 0;
    let timer = 0;
    glyph.addEventListener('click', () => {
      clicks += 1;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        clicks = 0;
      }, 600);
      if (clicks >= 3) {
        clicks = 0;
        triggerIntruder();
      }
    });
  }
}
