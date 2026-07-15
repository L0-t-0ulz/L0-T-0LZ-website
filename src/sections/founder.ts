import { h } from './dom';
import { founder, brand } from '../data/content';
import { eyeSVG } from './eye-svg';

export function buildFounder(): HTMLElement {
  const quote = founder.quote.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return h<HTMLElement>(`
    <section class="section founder" id="founder">
      <div class="founder__eye" aria-hidden="true">${eyeSVG()}</div>
      <div class="container">
        <div class="founder__inner">
          <p class="eyebrow-index reveal" style="margin-bottom:2rem">${founder.index}</p>
          <p class="founder__quote reveal">${quote}</p>
          <p class="founder__by reveal">${founder.by}</p>
          <a class="btn btn--primary reveal" data-magnetic="0.4" href="mailto:${brand.email}">
            ✦ Get in touch
          </a>
        </div>
      </div>
    </section>
  `);
}
