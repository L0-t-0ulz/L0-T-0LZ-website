/* ============================================================
   Feature detection — drives all motion / 3D gating.
   ============================================================ */

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
const noHover = window.matchMedia('(hover: none)').matches;
const webgl = detectWebGL();

/** Rough low-power heuristic: mobile / few cores => lighter 3D. */
const lowPower =
  coarsePointer ||
  (typeof navigator !== 'undefined' &&
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4);

export const capabilities = {
  reducedMotion,
  coarsePointer,
  noHover,
  webgl,
  lowPower,
  /**
   * Should we run the WebGL scenes (hero eyes + DesignIO garment)?
   * These are core brand visuals, so they render whenever WebGL is available —
   * independent of the OS reduce-motion setting. (Supplemental scroll motion
   * below still respects reduce-motion.)
   */
  allow3D: webgl,
  /** Should we run DOM motion (reveals, marquee, magnetic, cursor)? */
  allowMotion: !reducedMotion,
  /** Custom cursor only for fine pointers with hover. */
  allowCursor: !reducedMotion && !coarsePointer && !noHover,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
};

export type Capabilities = typeof capabilities;
