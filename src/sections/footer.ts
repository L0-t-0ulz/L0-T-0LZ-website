import { h } from './dom';
import { footer, brand } from '../data/content';
import { eyesPair } from './eye-svg';
import { reveal } from '../core/reveal';
import { capabilities } from '../core/capabilities';
import { foundFragment } from '../core/hunt';

export function buildFooter(): HTMLElement {
  const section = h<HTMLElement>(`
    <footer class="footer" id="contact">
      <div class="container">
        <p class="eyebrow-index reveal" style="margin-bottom:1.5rem">07 / CONTACT</p>
        <a class="footer__cta text-grad reveal" data-magnetic="0.25" href="mailto:${brand.email}">
          ${footer.cta}
        </a>

        <div class="footer__eyes reveal" aria-hidden="true">${eyesPair()}</div>

        <div class="footer__meta">
          <nav class="footer__links" aria-label="Footer">
            <a href="mailto:${brand.email}">Email</a>
            <a href="${brand.github}" target="_blank" rel="noopener">GitHub</a>
            <a href="#top" data-scroll-top>Back to top ↑</a>
          </nav>
          <p class="footer__fine mono">${footer.fine}</p>
        </div>

        <div class="footer__wordmark" aria-hidden="true">${brand.wordmark}</div>
      </div>
      <button class="hunt-sigil" type="button" data-hunt-sigil aria-label="hidden signal">◈</button>
    </footer>
  `);

  // T29 — hidden fragment: the barely-visible sigil tucked in the footer.
  section.querySelector<HTMLButtonElement>('[data-hunt-sigil]')?.addEventListener('click', (e) => {
    const el = e.currentTarget as HTMLButtonElement;
    el.classList.add('is-found');
    foundFragment('sigil');
  });

  // Back-to-top
  section.querySelector<HTMLAnchorElement>('[data-scroll-top]')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: capabilities.reducedMotion ? 'auto' : 'smooth' });
  });

  // One-time blink of the footer eyes when they enter view.
  const eyes = section.querySelector<HTMLElement>('.footer__eyes');
  if (eyes && !capabilities.reducedMotion) {
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          eyes.animate(
            [
              { transform: 'scaleY(1)' },
              { transform: 'scaleY(0.05)' },
              { transform: 'scaleY(1)' },
            ],
            { duration: 420, easing: 'ease-in-out', delay: 250 }
          );
          o.disconnect();
        });
      },
      { threshold: 0.6 }
    );
    obs.observe(eyes);
  }
  reveal(eyes);

  return section;
}
