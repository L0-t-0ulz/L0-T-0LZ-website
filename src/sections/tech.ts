import { h } from './dom';
import { tech } from '../data/content';

export function buildTech(): HTMLElement {
  const tags = tech.tags.map((t) => `<span class="tag reveal">${t}</span>`).join('');
  const stack = tech.stack.map((s) => `<span class="badge reveal">◆ ${s}</span>`).join('');

  return h<HTMLElement>(`
    <section class="section tech" id="tech">
      <div class="container">
        <div class="sec-head reveal">
          <span class="kicker">Domains</span>
          <h2>${tech.title}</h2>
          <span class="sec-head__index">${tech.index}</span>
        </div>
        <div class="tech__tags">${tags}</div>
        <div class="tech__stack">
          <span class="eyebrow-index" style="margin-right:0.5rem">STACK //</span>
          ${stack}
        </div>
      </div>
    </section>
  `);
}
