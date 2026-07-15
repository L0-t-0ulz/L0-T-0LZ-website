import { h } from './dom';
import { designio } from '../data/content';

export function buildDesignio(): HTMLElement {
  const specs = designio.specs
    .map(
      ([k, v]) => `<li class="reveal"><span class="k">${k}</span><span class="v">${v}</span></li>`
    )
    .join('');

  // Wire the CLO3D / Browzwear reference links into the intro copy.
  let intro = designio.intro;
  designio.links.forEach((l) => {
    intro = intro.replace(
      l.label,
      `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`
    );
  });

  return h<HTMLElement>(`
    <section class="section designio" id="designio">
      <div class="container">
        <div class="sec-head reveal">
          <span class="kicker">Flagship</span>
          <span class="sec-head__index">${designio.index}</span>
        </div>

        <div class="designio__grid">
          <div class="designio__copy">
            <h2 class="text-grad" style="font-size:var(--fs-h1);margin-bottom:1.4rem">${designio.title}</h2>
            <p class="reveal" style="font-size:var(--fs-lead);color:var(--white)">${intro}</p>
            <p class="reveal">${designio.body}</p>
            <ul class="designio__specs">${specs}</ul>
          </div>

          <div class="designio__stage framed" data-garment aria-hidden="true">
            <span class="designio__stage-label mono"><b>DESIGN·IO</b> // LIVE GARMENT</span>
          </div>
        </div>
      </div>
    </section>
  `);
}
