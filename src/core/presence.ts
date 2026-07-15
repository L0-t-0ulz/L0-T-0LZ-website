/* ============================================================
   F5 — Live presence client. Heartbeats a per-session id to
   /api/presence every 15s and shows a pulsing "◉ N exploring now"
   readout. Real concurrency (Redis); hidden if no store.
   ============================================================ */

const PID_KEY = 'lostsoulz:pid';
const BEAT_MS = 15_000;

function sessionId(): string {
  let id = '';
  try {
    id = sessionStorage.getItem(PID_KEY) ?? '';
  } catch {
    /* ignore */
  }
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    try {
      sessionStorage.setItem(PID_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

export function initPresence(): void {
  const id = sessionId();
  let hud: HTMLElement | null = null;
  let countEl: HTMLElement | null = null;
  let timer = 0;

  function ensureHud(count: number): void {
    if (!hud) {
      hud = document.createElement('div');
      hud.className = 'presence-hud mono';
      hud.setAttribute('aria-hidden', 'true');
      hud.innerHTML = `<span class="presence-hud__dot"></span>◉ <b class="presence-hud__n">${count}</b> exploring now`;
      countEl = hud.querySelector('.presence-hud__n');
      document.body.appendChild(hud);
      requestAnimationFrame(() => hud?.classList.add('is-in'));
    }
    if (countEl) countEl.textContent = String(count);
  }

  async function beat(): Promise<void> {
    try {
      const res = await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { count: number | null };
      if (typeof data.count === 'number' && data.count > 0) ensureHud(data.count);
    } catch {
      /* offline / no store — stay silent, never fake it */
    }
  }

  function start(): void {
    if (timer) return;
    void beat();
    timer = window.setInterval(beat, BEAT_MS);
  }
  function stop(): void {
    window.clearInterval(timer);
    timer = 0;
  }

  // Only count active tabs; pause the heartbeat when hidden so the number is honest.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
  if (!document.hidden) start();
}
