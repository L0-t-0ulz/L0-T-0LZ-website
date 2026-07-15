/* ============================================================
   Shared WebGL helpers: renderer factory + visibility-gated loop.
   ============================================================ */
import * as THREE from 'three';
import { capabilities } from './capabilities';

export function createRenderer(container: HTMLElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(capabilities.dpr);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);
  return renderer;
}

export interface Loopable {
  update(dt: number, elapsed: number): void;
  resize(w: number, h: number): void;
  dispose(): void;
}

/**
 * Drives a scene's RAF loop only while its container is on-screen and the
 * tab is visible. Also handles container resize.
 */
export class SceneRunner {
  private raf = 0;
  private last = 0;
  private elapsed = 0;
  private visible = false;
  private io: IntersectionObserver;
  private ro: ResizeObserver;

  constructor(
    private container: HTMLElement,
    private scene: Loopable
  ) {
    this.io = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        this.visible ? this.start() : this.stop();
      },
      { threshold: 0.01 }
    );
    this.io.observe(container);

    this.ro = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = this.container;
      if (w > 0 && h > 0) this.scene.resize(w, h);
    });
    this.ro.observe(container);

    document.addEventListener('visibilitychange', this.onVisibility);
  }

  private onVisibility = () => {
    if (document.hidden) this.stop();
    else if (this.visible) this.start();
  };

  private tick = (now: number) => {
    const dt = this.last ? (now - this.last) / 1000 : 0;
    this.last = now;
    this.elapsed += dt;
    this.scene.update(Math.min(dt, 0.05), this.elapsed);
    this.raf = requestAnimationFrame(this.tick);
  };

  start(): void {
    if (this.raf) return;
    this.last = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (!this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  dispose(): void {
    this.stop();
    this.io.disconnect();
    this.ro.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.scene.dispose();
  }
}
