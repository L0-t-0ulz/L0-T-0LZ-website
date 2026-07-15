/* Tiny helper: build a DOM node from an HTML string (trusted, in-repo content). */
export function h<T extends HTMLElement = HTMLElement>(html: string): T {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild as T;
}
