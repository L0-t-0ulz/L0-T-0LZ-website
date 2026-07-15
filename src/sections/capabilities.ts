import { h } from './dom';
import { capabilities as caps } from '../data/content';
import { countUp } from '../core/reveal';
import { capabilities } from '../core/capabilities';
import { gsap } from 'gsap';

export function buildCapabilities(): HTMLElement {
  const cards = caps.cards
    .map(
      (c, i) => `
      <article class="cap glass reveal" data-tilt>
        <span class="cap__idx">0${i + 1}</span>
        <span class="cap__stat" ${c.countTo !== null ? `data-count="${c.countTo}" data-suffix="${c.suffix}"` : ''}>${c.stat}</span>
        <span class="cap__name">${c.name}</span>
        <span class="cap__desc">${c.desc}</span>
      </article>`
    )
    .join('');

  const section = h<HTMLElement>(`
    <section class="section capabilities" id="capabilities">
      <div class="container">
        <div class="sec-head reveal">
          <span class="kicker">Capabilities</span>
          <h2>${caps.title}</h2>
          <span class="sec-head__index">${caps.index}</span>
        </div>
        <div class="caps__grid">${cards}</div>
      </div>
    </section>
  `);

  // Count-ups
  section.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    countUp(el, target, el.dataset.suffix ?? '');
  });

  // Subtle 3D tilt on hover (fine pointers only).
  if (!capabilities.coarsePointer && capabilities.allowMotion) {
    section.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotationY: px * 8,
          rotationX: -py * 8,
          transformPerspective: 700,
          duration: 0.4,
          ease: 'power2',
        });
      });
      card.addEventListener('pointerleave', () => {
        gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3' });
      });
    });
  }

  return section;
}
