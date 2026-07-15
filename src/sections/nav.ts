import { h } from './dom';
import { brand, navLinks } from '../data/content';
import { scrollTo } from '../core/scroll';

export function buildNav(): HTMLElement {
  const links = navLinks
    .map((l) => `<a class="nav-link" href="${l.href}">${l.label}</a>`)
    .join('');

  const nav = h<HTMLElement>(`
    <header class="nav" role="banner">
      <a class="nav__brand" href="#top" aria-label="${brand.wordmark} home">
        <span class="glyph">◎◎</span> ${brand.wordmark}
      </a>
      <nav class="nav__links" aria-label="Primary">
        ${links}
        <span class="nav__status">
          <span class="pill"><span class="dot"></span>${brand.status}</span>
        </span>
      </nav>
    </header>
  `);

  // Smooth-scroll for in-page anchors.
  nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      const target = id === '#top' ? document.body : document.querySelector(id);
      if (target) {
        e.preventDefault();
        scrollTo(id === '#top' ? document.body : (target as HTMLElement));
      }
    });
  });

  // Glass background after scrolling past hero-ish threshold.
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return nav;
}
