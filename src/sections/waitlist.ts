import { h } from './dom';
import { confetti } from '../core/burst';
import { audio } from '../core/audio';

const STORE_KEY = 'lostsoulz:waitlist';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Joined {
  email: string;
  position: number | null;
}

export function buildWaitlist(): HTMLElement {
  const section = h<HTMLElement>(`
    <section class="section waitlist" id="waitlist">
      <div class="container">
        <div class="waitlist__card glass framed">
          <span class="kicker">Early access</span>
          <h2 class="waitlist__title">Get first optics on <span class="text-grad">DesignIO</span>.</h2>
          <p class="waitlist__lead">Join the waitlist — we're onboarding designers in waves.</p>
          <form class="waitlist__form" novalidate>
            <input
              class="waitlist__input mono"
              type="email"
              name="email"
              inputmode="email"
              autocomplete="email"
              placeholder="you@studio.com"
              aria-label="Email address"
              required
            />
            <button class="btn btn--primary waitlist__submit" type="submit" data-magnetic="0.3">
              Join the waitlist →
            </button>
          </form>
          <p class="waitlist__status mono" role="status" aria-live="polite"></p>
        </div>
      </div>
    </section>
  `);

  const form = section.querySelector<HTMLFormElement>('.waitlist__form')!;
  const input = section.querySelector<HTMLInputElement>('.waitlist__input')!;
  const submit = section.querySelector<HTMLButtonElement>('.waitlist__submit')!;
  const status = section.querySelector<HTMLElement>('.waitlist__status')!;

  const setStatus = (msg: string, kind: 'ok' | 'err' | 'muted' = 'muted') => {
    status.textContent = msg;
    status.dataset.kind = kind;
  };

  const showJoined = (j: Joined, celebrate: boolean) => {
    form.style.display = 'none';
    if (j.position != null) {
      setStatus(`✓ You're #${j.position.toLocaleString()} in line. We'll be in touch.`, 'ok');
    } else {
      setStatus("✓ You're on the list. We'll confirm your spot by email.", 'ok');
    }
    if (celebrate) {
      confetti();
      audio.success();
    }
  };

  // Returning visitor — show their saved spot.
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) showJoined(JSON.parse(saved) as Joined, false);
  } catch {
    /* ignore */
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setStatus('Enter a valid email.', 'err');
      input.focus();
      return;
    }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = 'Joining…';
    setStatus('Reserving your spot…', 'muted');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`http ${res.status}`);
      const data = (await res.json()) as { position: number | null };
      const joined: Joined = { email, position: data.position };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(joined));
      } catch {
        /* ignore */
      }
      showJoined(joined, true);
    } catch {
      submit.disabled = false;
      submit.textContent = original;
      setStatus(
        import.meta.env.DEV
          ? 'Waitlist runs on the deployed site (no serverless in dev).'
          : "Couldn't reach the waitlist — try again in a moment.",
        'err'
      );
    }
  });

  return section;
}
