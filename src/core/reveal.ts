/* ============================================================
   Scroll reveals, word-splitting, count-ups.
   Uses IntersectionObserver — cheap, no per-frame cost.
   ============================================================ */
import { capabilities } from './capabilities';

const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
);

/** Observe an element (or NodeList) for a one-shot reveal. */
export function reveal(el: Element | null | undefined): void {
  if (!el) return;
  if (capabilities.reducedMotion) {
    el.classList.add('is-in');
    return;
  }
  io.observe(el);
}

export function revealAll(selector: string, root: ParentNode = document): void {
  root.querySelectorAll(selector).forEach((el) => reveal(el));
}

/** Wrap each word of an element's text in <span class="word"> for staggered reveal. */
export function splitWords(el: HTMLElement): void {
  const text = el.textContent ?? '';
  el.textContent = '';
  const words = text.split(/(\s+)/);
  words.forEach((w) => {
    if (/^\s+$/.test(w)) {
      el.appendChild(document.createTextNode(w));
    } else if (w.length) {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      el.appendChild(span);
    }
  });

  if (capabilities.reducedMotion) {
    el.querySelectorAll('.word').forEach((s) => s.classList.add('is-in'));
    return;
  }

  const wordEls = Array.from(el.querySelectorAll<HTMLElement>('.word'));
  const once = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        wordEls.forEach((s, i) => {
          s.style.transitionDelay = `${i * 45}ms`;
          s.classList.add('is-in');
        });
        obs.disconnect();
      });
    },
    { threshold: 0.3 }
  );
  once.observe(el);
}

/** Animate a number from 0 -> target when it scrolls into view. */
export function countUp(el: HTMLElement, target: number, suffix = ''): void {
  if (capabilities.reducedMotion) {
    el.textContent = `${target}${suffix}`;
    return;
  }
  const once = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const duration = 1400;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      });
    },
    { threshold: 0.5 }
  );
  once.observe(el);
}
