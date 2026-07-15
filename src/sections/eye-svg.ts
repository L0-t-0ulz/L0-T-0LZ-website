/** A single decorative HUD eye as inline SVG (used as watermarks). */
export function eyeSVG(): string {
  return `
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 60 Q100 8 192 60 Q100 112 8 60 Z" stroke="#3aa0ff" stroke-width="1.5"/>
      <circle cx="100" cy="60" r="34" stroke="#6cc5ff" stroke-width="1.2"/>
      <circle cx="100" cy="60" r="24" stroke="#6cc5ff" stroke-width="0.8" opacity="0.6"/>
      <circle cx="100" cy="60" r="14" stroke="#7df9ff" stroke-width="0.8" opacity="0.5"/>
      <circle cx="100" cy="60" r="7" fill="#eaf6ff"/>
      <line x1="52" y1="60" x2="70" y2="60" stroke="#6cc5ff" stroke-width="1"/>
      <line x1="130" y1="60" x2="148" y2="60" stroke="#6cc5ff" stroke-width="1"/>
      <line x1="100" y1="30" x2="100" y2="40" stroke="#6cc5ff" stroke-width="1"/>
      <line x1="100" y1="80" x2="100" y2="90" stroke="#6cc5ff" stroke-width="1"/>
    </svg>`;
}

/** A pair of eyes for the footer. */
export function eyesPair(): string {
  return `<div style="display:flex;gap:8%;justify-content:center">${eyeSVG()}${eyeSVG()}</div>`;
}
