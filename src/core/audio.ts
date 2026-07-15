/* ============================================================
   T01 — Web Audio UI sound engine.
   Tiny synth for hover/click/whoosh/success. OFF by default
   (guardrail); a visible toggle unmutes. Context created on
   the first user gesture (autoplay policy).
   ============================================================ */

const MUTE_KEY = 'lostsoulz:muted';

type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = true;
let toggleEl: HTMLButtonElement | null = null;

// F1 — analyser (audio-reactive visuals) + ambient pad
let analyser: AnalyserNode | null = null;
let analyserData: Uint8Array<ArrayBuffer> | null = null;
let padGain: GainNode | null = null;
let padBuilt = false;
let level = 0; // smoothed 0..1 output level

function ensureCtx(): void {
  if (ctx) return;
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.42;
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyserData = new Uint8Array(new ArrayBuffer(analyser.fftSize));
  master.connect(analyser);
  analyser.connect(ctx.destination);
  buildPad();
}

/** A soft evolving drone through a slow-swept lowpass — the site's ambient. */
function buildPad(): void {
  if (!ctx || !master || padBuilt) return;
  padBuilt = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 520;
  filter.Q.value = 6;
  padGain = ctx.createGain();
  padGain.gain.value = 0;
  filter.connect(padGain).connect(master);

  [82.41, 110.0, 164.81].forEach((f, i) => {
    const osc = ctx!.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    osc.detune.value = (i - 1) * 6;
    const g = ctx!.createGain();
    g.gain.value = 0.1;
    osc.connect(g).connect(filter);
    osc.start();
  });

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 260;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
}

function rampPad(to: number): void {
  if (!ctx || !padGain) return;
  padGain.gain.cancelScheduledValues(ctx.currentTime);
  padGain.gain.setTargetAtTime(to, ctx.currentTime, 1.5);
}

/** Smoothed 0..1 output level for audio-reactive visuals (decays when muted). */
export function audioLevel(): number {
  if (!analyser || !analyserData || muted) {
    level *= 0.9;
    return level;
  }
  analyser.getByteTimeDomainData(analyserData);
  let sum = 0;
  for (let i = 0; i < analyserData.length; i++) {
    const v = (analyserData[i] - 128) / 128;
    sum += v * v;
  }
  const norm = Math.min(1, Math.sqrt(sum / analyserData.length) * 3.5);
  level += (norm - level) * 0.25;
  return level;
}

/** One short enveloped tone. */
function blip(
  freq: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.15,
  sweepTo?: number
): void {
  if (muted || !ctx || !master) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), now + dur);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(g).connect(master);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

function hover(): void {
  blip(920, 0.05, 'sine', 0.05);
}
function click(): void {
  blip(300, 0.12, 'triangle', 0.16, 680);
}
function whoosh(): void {
  blip(150, 0.26, 'sawtooth', 0.07, 42);
}
function success(): void {
  blip(523, 0.12, 'triangle', 0.14);
  window.setTimeout(() => blip(784, 0.18, 'triangle', 0.14), 90);
}

function updateToggle(): void {
  if (!toggleEl) return;
  toggleEl.classList.toggle('is-on', !muted);
  toggleEl.setAttribute('aria-pressed', String(!muted));
  toggleEl.innerHTML = muted
    ? '<span aria-hidden="true">🔇</span> Sound off'
    : '<span aria-hidden="true">🔊</span> Sound on';
}

function setMuted(v: boolean): void {
  muted = v;
  try {
    localStorage.setItem(MUTE_KEY, v ? '1' : '0');
  } catch {
    /* ignore */
  }
  updateToggle();
}

function toggle(): void {
  const next = !muted;
  setMuted(next);
  if (!next) {
    ensureCtx();
    void ctx?.resume();
    rampPad(0.05); // fade the ambient pad in
    click(); // confirmation blip
  } else {
    rampPad(0); // fade the ambient pad out
  }
}

function buildToggle(): void {
  toggleEl = document.createElement('button');
  toggleEl.className = 'fx-sound';
  toggleEl.type = 'button';
  toggleEl.setAttribute('aria-label', 'Toggle interface sound');
  toggleEl.addEventListener('click', toggle);
  document.body.appendChild(toggleEl);
  updateToggle();
}

export const audio = { hover, click, whoosh, success, get muted() {
  return muted;
} };

export function initAudio(): void {
  try {
    muted = localStorage.getItem(MUTE_KEY) !== '0';
  } catch {
    muted = true;
  }

  // Create/resume the context on the first gesture so unmuting later is instant.
  const unlock = () => {
    ensureCtx();
    void ctx?.resume();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  // Interface sounds (no-op while muted).
  document.addEventListener('pointerover', (e) => {
    if ((e.target as HTMLElement).closest('a, button, [data-magnetic]')) hover();
  });
  document.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('a, button, [data-magnetic]')) click();
  });

  buildToggle();
}
