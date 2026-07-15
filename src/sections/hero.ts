import { h } from './dom';
import { brand, hero } from '../data/content';
import { scrollTo } from '../core/scroll';

export function buildHero(): HTMLElement {
  const readout = (rows: [string, string][]) =>
    rows.map(([k, v]) => `<div><b>${k}</b> ${v}</div>`).join('');

  const section = h<HTMLElement>(`
    <section class="hero" id="top">
      <div class="hero__canvas" aria-hidden="true"></div>
      <div class="hero__fallback" aria-hidden="true"></div>

      <div class="hero__inner" data-tilt-layer="1">
        <p class="hero__tag reveal">${hero.tag}</p>
        <h1 class="hero__title reveal">
          <span class="text-grad">${hero.titleLines[0]}</span><br />
          <span>${hero.titleLines[1]}</span>
        </h1>
        <p class="hero__lead reveal">${hero.lead}</p>
        <div class="hero__cta reveal">
          <button class="btn btn--primary" data-magnetic="0.4" data-scroll="#designio">
            Explore DesignIO ↓
          </button>
          <a class="btn btn--ghost" data-magnetic="0.3" href="#contact" data-scroll="#contact">
            Contact
          </a>
        </div>
      </div>

      <div class="hero__readout hero__readout--bl mono" data-tilt-layer="1.8">${readout(hero.readoutLeft)}</div>
      <div class="hero__readout hero__readout--br mono" data-tilt-layer="1.8">${readout(hero.readoutRight)}</div>

      <div class="hero__scrollcue" aria-hidden="true">
        <span>▾</span> Scroll
      </div>
    </section>
  `);

  section.querySelectorAll<HTMLElement>('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollTo(btn.dataset.scroll!);
    });
  });

  // Give the wordmark to the title screen-reader label context.
  section.setAttribute('aria-label', `${brand.wordmark} — ${hero.titleLines.join(' ')}`);

  return section;
}
