/* ============================================================
   T05 — Scroll-progress scan-line. A fixed side rail with a
   cyan fill + % readout, plus a tick per section that "locks"
   as it passes.
   ============================================================ */

export function initProgress(): void {
  const rail = document.createElement('div');
  rail.className = 'fx-progress';
  rail.setAttribute('aria-hidden', 'true');
  rail.innerHTML = `
    <div class="fx-progress__fill"></div>
    <div class="fx-progress__ticks"></div>
    <div class="fx-progress__pct mono">0%</div>`;
  document.body.appendChild(rail);

  const fill = rail.querySelector<HTMLElement>('.fx-progress__fill')!;
  const pct = rail.querySelector<HTMLElement>('.fx-progress__pct')!;
  const ticksHost = rail.querySelector<HTMLElement>('.fx-progress__ticks')!;

  // One tick per top-level section (positioned by scroll fraction).
  const sections = Array.from(document.querySelectorAll<HTMLElement>('#main > section, .footer'));
  const ticks: { el: HTMLElement; frac: number }[] = [];

  function layoutTicks(): void {
    ticksHost.innerHTML = '';
    ticks.length = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    sections.forEach((s) => {
      const frac = scrollable > 0 ? Math.min(1, s.offsetTop / scrollable) : 0;
      const el = document.createElement('span');
      el.className = 'fx-progress__tick';
      el.style.top = `${frac * 100}%`;
      ticksHost.appendChild(el);
      ticks.push({ el, frac });
    });
  }

  let ticking = false;
  function update(): void {
    ticking = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const p = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    fill.style.transform = `scaleY(${p})`;
    pct.textContent = `${Math.round(p * 100)}%`;
    for (const t of ticks) t.el.classList.toggle('is-passed', p >= t.frac - 0.001);
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', () => {
    layoutTicks();
    update();
  });

  // Layout after fonts/images settle so section offsets are correct.
  window.addEventListener('load', () => {
    layoutTicks();
    update();
  });
  layoutTicks();
  update();
}
