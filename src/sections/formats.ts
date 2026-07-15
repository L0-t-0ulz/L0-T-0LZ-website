import { h } from './dom';
import { formats } from '../data/content';

export function buildFormats(): HTMLElement {
  const chip = (c: string) => `<span class="chip"><span class="dot"></span>${c}</span>`;
  // Duplicate the chip set so the marquee loops seamlessly (-50% translate).
  const track = formats.chips.map(chip).join('') + formats.chips.map(chip).join('');

  const flow = formats.flow
    .map(
      (n, i) =>
        `<span class="pipeflow__node reveal">${n}</span>` +
        (i < formats.flow.length - 1 ? `<span class="pipeflow__arrow">──▸</span>` : '')
    )
    .join('');

  const section = h<HTMLElement>(`
    <section class="section formats" id="formats">
      <div class="container">
        <div class="sec-head reveal">
          <span class="kicker">Output</span>
          <h2>${formats.title}</h2>
          <span class="sec-head__index">${formats.index}</span>
        </div>
      </div>
      <div class="ticker" aria-hidden="true">
        <div class="ticker__track">${track}</div>
      </div>
      <div class="container">
        <div class="pipeflow">${flow}</div>
      </div>
    </section>
  `);

  // The ticker is a core brand element — it always scrolls continuously
  // (datajungle-style), independent of the OS reduce-motion setting.
  return section;
}
