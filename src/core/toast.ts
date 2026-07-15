/* ============================================================
   Reusable HUD toast (used by achievements; extensible for trophies).
   ============================================================ */

interface ToastOpts {
  title: string;
  body?: string;
  icon?: string;
  timeout?: number;
}

export function toast(opts: ToastOpts): void {
  let host = document.querySelector<HTMLElement>('.fx-toasts');
  if (!host) {
    host = document.createElement('div');
    host.className = 'fx-toasts';
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }

  const el = document.createElement('div');
  el.className = 'fx-toast glass';
  el.innerHTML = `
    <span class="fx-toast__icon" aria-hidden="true">${opts.icon ?? '✦'}</span>
    <div>
      <div class="fx-toast__title mono">${opts.title}</div>
      ${opts.body ? `<div class="fx-toast__body">${opts.body}</div>` : ''}
    </div>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-in'));

  window.setTimeout(() => {
    el.classList.remove('is-in');
    window.setTimeout(() => el.remove(), 450);
  }, opts.timeout ?? 4600);
}
