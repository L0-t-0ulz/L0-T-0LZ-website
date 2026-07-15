import { h } from './dom';
import { manifesto } from '../data/content';
import { capabilities } from '../core/capabilities';

/**
 * Builds the manifesto. Each word becomes a <span class="word"> for a
 * staggered reveal; words wrapped in *asterisks* also get the highlight class.
 */
export function buildManifesto(): HTMLElement {
  const section = h<HTMLElement>(`
    <section class="section manifesto" id="manifesto">
      <div class="container">
        <p class="eyebrow-index reveal" style="margin-bottom:2.5rem">${manifesto.index}</p>
        <p class="manifesto__text"></p>
        <div class="seam" aria-hidden="true"></div>
      </div>
    </section>
  `);

  const textEl = section.querySelector<HTMLElement>('.manifesto__text')!;
  const tokens = manifesto.text.split(/(\s+)/);
  tokens.forEach((tok) => {
    if (/^\s+$/.test(tok)) {
      textEl.appendChild(document.createTextNode(tok));
      return;
    }
    const highlighted = /^\*.*\*$/.test(tok);
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = tok.replace(/\*/g, '');
    if (highlighted) span.classList.add('word--hi');
    textEl.appendChild(span);
  });

  const words = Array.from(textEl.querySelectorAll<HTMLElement>('.word'));

  if (capabilities.reducedMotion) {
    words.forEach((w) => w.classList.add('is-in'));
    section.classList.add('is-in');
    return section;
  }

  const obs = new IntersectionObserver(
    (entries, o) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        section.classList.add('is-in'); // triggers .seam draw
        words.forEach((w, i) => {
          w.style.transitionDelay = `${i * 55}ms`;
          w.classList.add('is-in');
        });
        o.disconnect();
      });
    },
    { threshold: 0.35 }
  );
  obs.observe(section);

  return section;
}
