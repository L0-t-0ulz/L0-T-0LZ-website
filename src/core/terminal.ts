/* ============================================================
   T27 — Backtick HUD terminal. Press ` to toggle a fake console.
   Commands trigger effects + hunt fragments.
   ============================================================ */
import { audio } from './audio';
import { confetti } from './burst';
import { foundFragment, huntComplete, huntCount } from './hunt';
import { triggerIntruder } from './intruder';
import { openVault } from './vault';
import { shareCalibration } from './calibration';

let root: HTMLElement | null = null;
let logEl: HTMLElement | null = null;
let inputEl: HTMLInputElement | null = null;
let open = false;

const BANNER = [
  'L0$T$0LZ // OPTICS TERMINAL v1.0',
  "type <b>help</b> for commands · <b>`</b> to close",
];

function print(html: string): void {
  if (!logEl) return;
  const line = document.createElement('div');
  line.className = 'terminal__line';
  line.innerHTML = html;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function runMatrix(duration = 4200): void {
  const canvas = document.createElement('canvas');
  canvas.className = 'matrix-fx';
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.body.appendChild(canvas);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const glyphs = 'アカサタナハマヤラワ0123456789LOSTSOULZ$◈◎';
  const fontSize = 16;
  const cols = Math.ceil(window.innerWidth / fontSize);
  const drops = new Array(cols).fill(0).map(() => Math.random() * -50);
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    ctx.fillStyle = 'rgba(5,7,13,0.16)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = '#7df9ff';
    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
    for (let i = 0; i < cols; i++) {
      const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 1;
    }
    if (now - start < duration) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      canvas.style.opacity = '0';
      window.setTimeout(() => canvas.remove(), 600);
    }
  };
  raf = requestAnimationFrame(tick);
}

function handle(raw: string): void {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;
  print(`<span class="terminal__prompt">&gt;</span> ${raw}`);

  switch (cmd) {
    case 'help':
      print(
        'commands: <b>about</b> · <b>unlock</b> · <b>matrix</b> · <b>sudo forge</b> · <b>intruder</b> · <b>fragments</b> · <b>vault</b> · <b>share</b> · <b>whoami</b> · <b>clear</b> · <b>exit</b>'
      );
      break;
    case 'about':
      print('LO$T$0LZ — forging the future of fashion, in 3D. Flagship: DesignIO.');
      break;
    case 'whoami':
      print('guest@lostsoulz — clearance: <span style="color:var(--cyan)">visitor</span>');
      break;
    case 'unlock':
      print('decrypting… <span style="color:var(--cyan)">fragment recovered ◈</span>');
      foundFragment('terminal');
      break;
    case 'matrix':
      print('entering the grid…');
      runMatrix();
      break;
    case 'sudo forge':
    case 'sudo':
      print('<span style="color:#38f5a8">root granted.</span> forging…');
      confetti();
      audio.success();
      break;
    case 'intruder':
      print('<span style="color:#ff5b7a">tripping the optics…</span>');
      triggerIntruder();
      break;
    case 'fragments':
    case 'hunt':
      print(`fragments recovered: <b>${huntCount()}/3</b>`);
      break;
    case 'vault':
      if (huntComplete()) {
        print('<span style="color:#38f5a8">access granted.</span> opening the vault…');
        openVault();
      } else {
        print(
          `<span style="color:#ff5b7a">access denied</span> — 3 fragments required (${huntCount()}/3).`
        );
      }
      break;
    case 'share':
    case 'calibrate':
      print('rendering your optic calibration…');
      void shareCalibration();
      break;
    case 'clear':
      if (logEl) logEl.innerHTML = '';
      break;
    case 'exit':
    case 'close':
    case 'quit':
      toggle(false);
      break;
    default:
      print(`<span style="color:#ff5b7a">unknown command:</span> ${cmd} — try <b>help</b>`);
  }
}

function build(): void {
  root = document.createElement('div');
  root.className = 'terminal';
  root.innerHTML = `
    <div class="terminal__log"></div>
    <div class="terminal__inputline">
      <span class="terminal__prompt">&gt;</span>
      <input class="terminal__input mono" type="text" spellcheck="false"
        autocomplete="off" autocapitalize="off" aria-label="Terminal input" />
    </div>`;
  document.body.appendChild(root);
  logEl = root.querySelector('.terminal__log');
  inputEl = root.querySelector('.terminal__input');
  BANNER.forEach((l) => print(l));

  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const v = inputEl!.value;
      inputEl!.value = '';
      handle(v);
    } else if (e.key === 'Escape') {
      toggle(false);
    }
  });
}

function toggle(next?: boolean): void {
  open = next ?? !open;
  if (open && !root) build();
  root?.classList.toggle('is-open', open);
  if (open) window.setTimeout(() => inputEl?.focus(), 50);
}

export function initTerminal(): void {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Backquote') {
      e.preventDefault();
      toggle();
    }
  });
}
