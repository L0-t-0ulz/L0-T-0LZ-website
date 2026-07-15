/* ============================================================
   T29 — Easter-egg hunt. Three fragments hidden across the site;
   recover all three to unlock the VAULT.
     • 'intruder' — trip INTRUDER mode (Konami / triple-click the eyes)
     • 'terminal' — the `unlock` command in the backtick console
     • 'sigil'    — find + click the hidden glyph in the footer
   ============================================================ */
import { toast } from './toast';
import { audio } from './audio';
import { openVault } from './vault';

const KEY = 'lostsoulz:hunt';
const FRAGMENTS = ['intruder', 'terminal', 'sigil'] as const;
export type Fragment = (typeof FRAGMENTS)[number];

let found = new Set<string>();
let hud: HTMLElement | null = null;

function load(): void {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) found = new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
}
function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...found]));
  } catch {
    /* ignore */
  }
}

function count(): number {
  return FRAGMENTS.filter((f) => found.has(f)).length;
}

function ensureHud(): void {
  if (hud) return;
  hud = document.createElement('div');
  hud.className = 'hunt-hud mono';
  hud.setAttribute('aria-hidden', 'true');
  hud.addEventListener('click', () => {
    if (count() >= 3) openVault();
  });
  document.body.appendChild(hud);
  renderHud();
}
function renderHud(): void {
  if (!hud) return;
  const n = count();
  hud.innerHTML = `◈ FRAGMENTS <b>${n}/3</b>`;
  hud.classList.toggle('is-complete', n >= 3);
}

export function foundFragment(id: Fragment): void {
  if (found.has(id)) {
    ensureHud();
    return;
  }
  found.add(id);
  save();
  ensureHud();
  renderHud();
  const n = count();
  audio.success();
  toast({
    icon: '◈',
    title: `FRAGMENT RECOVERED · ${n}/3`,
    body: n < 3 ? 'A hidden signal. Keep hunting…' : 'All fragments recovered. The vault is open.',
  });
  if (n >= 3) window.setTimeout(() => openVault(), 1000);
}

export function huntComplete(): boolean {
  return count() >= 3;
}
export function huntCount(): number {
  return count();
}

export function initHunt(): void {
  load();
  if (count() > 0) ensureHud(); // only reveal the tracker once they've started
}
