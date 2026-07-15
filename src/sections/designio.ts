import { h } from './dom';
import { designio, fabrics } from '../data/content';
import { audio } from '../core/audio';

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

  // T14 — fabric swatches.
  const swatches = fabrics
    .map(
      (f, i) => `
      <button class="swatch${i === 0 ? ' is-active' : ''}" type="button"
        data-fabric="${i}" title="${f.name}" aria-label="${f.name}"
        aria-pressed="${i === 0 ? 'true' : 'false'}">
        <span class="swatch__chip" style="--c:${f.hex}"></span>
        <span class="swatch__name mono">${f.name}</span>
      </button>`
    )
    .join('');

  const section = h<HTMLElement>(`
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

          <div class="designio__viz">
            <div class="designio__stage framed" data-garment aria-hidden="true">
              <span class="designio__stage-label mono"><b>DESIGN·IO</b> // LIVE GARMENT</span>
              <span class="designio__hint mono">⟲ drag to rotate</span>
            </div>
            <div class="designio__swatches" role="group" aria-label="Choose fabric">
              ${swatches}
            </div>
          </div>
        </div>
      </div>
    </section>
  `);

  // Wire swatch clicks → tell the 3D scene to re-drape, update active state.
  const swatchEls = Array.from(section.querySelectorAll<HTMLButtonElement>('.swatch'));
  swatchEls.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.fabric);
      document.dispatchEvent(new CustomEvent<number>('lz:fabric', { detail: index }));
      swatchEls.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      audio.whoosh();
    });
  });

  return section;
}
