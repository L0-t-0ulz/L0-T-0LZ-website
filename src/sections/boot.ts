/* ============================================================
   T03 — Boot / "OPTICS ONLINE" intro. A one-time (per session)
   HUD power-up sequence. Skippable. Always plays — it's a core
   brand moment — but stays short.
   ============================================================ */

const KEY = 'lostsoulz:boot';

const LINES = [
  '> INITIALIZING LO$T$0LZ',
  '> LOADING OPTICS…',
  '> CALIBRATING IRIS ARRAYS',
  '> XPBD CORE ONLINE',
  '> OPTICS ONLINE ✓',
];

export function initBoot(): void {
  try {
    if (sessionStorage.getItem(KEY) === '1') return;
  } catch {
    /* ignore */
  }

  const overlay = document.createElement('div');
  overlay.className = 'fx-boot';
  overlay.innerHTML = `
    <div class="fx-boot__inner">
      <div class="fx-boot__eye" aria-hidden="true">◎◎</div>
      <div class="fx-boot__log mono"></div>
      <div class="fx-boot__bar"><div class="fx-boot__barfill"></div></div>
      <button class="fx-boot__skip mono" type="button">SKIP ▸</button>
    </div>`;
  document.body.appendChild(overlay);
  document.documentElement.classList.add('booting');

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    overlay.classList.add('is-done');
    document.documentElement.classList.remove('booting');
    window.setTimeout(() => overlay.remove(), 600);
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
  };

  overlay.querySelector('.fx-boot__skip')?.addEventListener('click', finish);

  const log = overlay.querySelector<HTMLElement>('.fx-boot__log')!;
  let i = 0;
  const type = () => {
    if (done) return;
    if (i < LINES.length) {
      const line = document.createElement('div');
      line.textContent = LINES[i];
      log.appendChild(line);
      i += 1;
      window.setTimeout(type, 260);
    } else {
      window.setTimeout(finish, 520);
    }
  };
  type();

  // Safety: never trap the user if something stalls.
  window.setTimeout(finish, 4000);
}
