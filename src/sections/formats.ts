import { h } from './dom';
import { formats } from '../data/content';

export function buildFormats(): HTMLElement {
  const chip = (c: string) => `<span class="chip"><span class="dot"></span>${c}</span>`;
  // Duplicate the chip set so the marquee loops seamlessly (-50% translate).
  const track = formats.chips.map(chip).join('') + formats.chips.map(chip).join('');

  // Pipeline flow as a marquee: nodes joined by arrows, with a trailing arrow
  // so the loop reads continuously into the next copy. Duplicated for the -50%
  // seamless loop; scrolls in reverse so it counter-moves against the chips.
  const arrow = '<span class="pipeflow__arrow">──▸</span>';
  const flowSeq =
    formats.flow.map((n) => `<span class="pipeflow__node">${n}</span>`).join(arrow) + arrow;
  const flowTrack = flowSeq + flowSeq;

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
      <div class="ticker ticker--flow" aria-hidden="true">
        <div class="ticker__track ticker__track--rev">${flowTrack}</div>
      </div>
    </section>
  `);

  // The ticker is a core brand element — it always scrolls continuously
  // (datajungle-style), independent of the OS reduce-motion setting.
  return section;
}
