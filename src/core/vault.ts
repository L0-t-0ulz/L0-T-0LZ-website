/* ============================================================
   T29 — The VAULT. Revealed when all hunt fragments are recovered.
   Shows a rotating sigil + a real early-access code the visitor can
   copy and use when they join the waitlist.
   ============================================================ */
import { confetti } from './burst';
import { audio } from './audio';
import { shareCalibration } from './calibration';

const CODE_KEY = 'lostsoulz:vaultcode';
let isOpen = false;

function generateCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const rnd = crypto.getRandomValues(new Uint32Array(5));
  let s = '';
  for (let i = 0; i < 5; i++) s += alphabet[rnd[i] % alphabet.length];
  return `FORGE-VIP-${s}`;
}

function getCode(): string {
  let code = '';
  try {
    code = localStorage.getItem(CODE_KEY) ?? '';
  } catch {
    /* ignore */
  }
  if (!code) {
    code = generateCode();
    try {
      localStorage.setItem(CODE_KEY, code);
    } catch {
      /* ignore */
    }
  }
  return code;
}

export function openVault(): void {
  if (isOpen) return;
  isOpen = true;
  const code = getCode();

  const overlay = document.createElement('div');
  overlay.className = 'vault';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'The Vault');
  overlay.innerHTML = `
    <div class="vault__inner glass">
      <div class="vault__sigil" aria-hidden="true"></div>
      <p class="vault__kicker mono">CLEARANCE GRANTED</p>
      <h2 class="vault__title text-grad">THE VAULT</h2>
      <p class="vault__body">You recovered all three fragments. Here is your early-access key — quote it when you join the DesignIO waitlist.</p>
      <div class="vault__code">
        <code class="mono">${code}</code>
        <button class="vault__copy mono" type="button">Copy</button>
      </div>
      <div class="vault__actions">
        <button class="vault__share btn btn--primary" type="button">✦ Share my calibration</button>
        <button class="vault__close btn btn--ghost" type="button">Close</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-in'));
  confetti();
  audio.success();

  const copyBtn = overlay.querySelector<HTMLButtonElement>('.vault__copy');
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code);
      copyBtn.textContent = 'Copied ✓';
    } catch {
      copyBtn.textContent = 'Copy failed';
    }
  });

  const close = () => {
    overlay.classList.remove('is-in');
    window.setTimeout(() => overlay.remove(), 500);
    isOpen = false;
  };
  overlay.querySelector('.vault__share')?.addEventListener('click', () => void shareCalibration());
  overlay.querySelector('.vault__close')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') close();
    },
    { once: true }
  );
}
