/* ============================================================
   F6 — Shareable "MY CALIBRATION" card. A deterministic per-visitor
   generative optic sigil rendered onto a 1080×1350 portrait card
   (eyes + sigil + wordmark + code) → native share or download.
   ============================================================ */
import { audio } from './audio';

const ID_KEY = 'lostsoulz:cid';
const CODE_KEY = 'lostsoulz:vaultcode'; // written by the vault (T29)

const BLUE = '#3aa0ff';
const CYAN = '#7df9ff';
const MAGENTA = '#b46cff';
const WHITE = '#eaf6ff';

function visitorId(): string {
  let id = '';
  try {
    id = localStorage.getItem(ID_KEY) ?? '';
  } catch {
    /* ignore */
  }
  if (!id) {
    const raw =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    id = raw.replace(/[^a-z0-9]/gi, '').slice(0, 12).toUpperCase();
    try {
      localStorage.setItem(ID_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawEye(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
  glow.addColorStop(0, 'rgba(58,160,255,0.55)');
  glow.addColorStop(0.5, 'rgba(180,108,255,0.14)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4);

  // almond
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.6, cy);
  ctx.quadraticCurveTo(cx, cy - r * 1.15, cx + r * 1.6, cy);
  ctx.quadraticCurveTo(cx, cy + r * 1.15, cx - r * 1.6, cy);
  ctx.closePath();
  ctx.fillStyle = '#0a1830';
  ctx.fill();
  ctx.strokeStyle = BLUE;
  ctx.lineWidth = 2;
  ctx.stroke();

  // concentric HUD rings
  for (let i = 3; i >= 1; i--) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * (i / 3), 0, Math.PI * 2);
    ctx.strokeStyle = i === 3 ? CYAN : 'rgba(108,197,255,0.6)';
    ctx.lineWidth = i === 3 ? 2 : 1;
    ctx.stroke();
  }
  // pupil
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = WHITE;
  ctx.fill();
  // reticle ticks
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = 2;
  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.moveTo(cx + s * r * 0.55, cy);
    ctx.lineTo(cx + s * r * 0.85, cy);
    ctx.stroke();
  });
}

function drawSigil(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rnd: () => number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  // rings
  const rings = 3 + Math.floor(rnd() * 3);
  for (let i = 0; i < rings; i++) {
    const rr = r * (0.35 + (i / rings) * 0.65);
    ctx.beginPath();
    const start = rnd() * Math.PI * 2;
    ctx.arc(0, 0, rr, start, start + Math.PI * (0.6 + rnd() * 1.4));
    ctx.strokeStyle = i % 2 ? MAGENTA : CYAN;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // radial spokes
  const spokes = 10 + Math.floor(rnd() * 14);
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < spokes; i++) {
    const a = rnd() * Math.PI * 2;
    const r0 = r * (0.2 + rnd() * 0.3);
    const r1 = r * (0.6 + rnd() * 0.4);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // core
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = WHITE;
  ctx.fill();
  ctx.restore();
}

function renderCard(): HTMLCanvasElement {
  const id = visitorId();
  const rnd = mulberry32(hashStr(id));
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.34, 0, W / 2, H * 0.34, W * 0.75);
  g.addColorStop(0, 'rgba(58,160,255,0.16)');
  g.addColorStop(0.5, 'rgba(180,108,255,0.07)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(108,197,255,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 90) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // corner crop-marks
  ctx.strokeStyle = 'rgba(108,197,255,0.5)';
  ctx.lineWidth = 3;
  const m = 46;
  const L = 40;
  const corner = (x: number, y: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * L);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * L, y);
    ctx.stroke();
  };
  corner(m, m, 1, 1);
  corner(W - m, m, -1, 1);
  corner(m, H - m, 1, -1);
  corner(W - m, H - m, -1, -1);

  ctx.textAlign = 'center';
  ctx.fillStyle = CYAN;
  ctx.font = '500 30px "JetBrains Mono", monospace';
  ctx.fillText('MY CALIBRATION', W / 2, H * 0.11);

  drawEye(ctx, W * 0.34, H * 0.32, 120);
  drawEye(ctx, W * 0.66, H * 0.32, 120);
  drawSigil(ctx, W / 2, H * 0.6, 190, rnd);

  ctx.fillStyle = WHITE;
  ctx.font = '700 96px "Chakra Petch", system-ui, sans-serif';
  ctx.fillText('LO$T$0LZ', W / 2, H * 0.83);
  ctx.fillStyle = '#6cc5ff';
  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.fillText('F O R G I N G · F A S H I O N · I N · 3 D', W / 2, H * 0.865);

  let code = '';
  try {
    code = localStorage.getItem(CODE_KEY) ?? '';
  } catch {
    /* ignore */
  }
  ctx.fillStyle = '#a7b6cc';
  ctx.font = '400 26px "JetBrains Mono", monospace';
  ctx.fillText(code || `CAL-${id.slice(0, 8)}`, W / 2, H * 0.93);

  return c;
}

export async function shareCalibration(): Promise<void> {
  audio.click();
  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
  const canvas = renderCard();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;

  const file = new File([blob], 'lostsoulz-calibration.png', { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: 'My LO$T$0LZ calibration',
        text: 'Forging fashion in 3D — lostsoulz.vercel.app',
      });
      return;
    } catch {
      /* fall through to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lostsoulz-calibration.png';
  a.click();
  URL.revokeObjectURL(url);
}
