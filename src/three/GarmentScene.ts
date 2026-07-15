/* ============================================================
   DesignIO stage — a procedural gown that reveals wireframe -> shaded,
   rotates with scroll, is drag-to-spin (T13), and re-drapes into
   different fabrics on the fly (T14).
   ============================================================ */
import * as THREE from 'three';
import { createRenderer, type Loopable } from '../core/renderer';
import { capabilities } from '../core/capabilities';
import { fabrics, type Fabric } from '../data/content';

const WHITE = new THREE.Color('#ffffff');

export class GarmentScene implements Loopable {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private garment = new THREE.Group();
  private shaded: THREE.Mesh;
  private wire: THREE.LineSegments;
  private shadedMat: THREE.MeshPhysicalMaterial;
  private wireMat: THREE.LineBasicMaterial;

  private progress = 0; // 0..1 from ScrollTrigger
  private reveal = 0; // eased wireframe->shaded

  // --- T13 drag-to-spin ---
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private userRot = 0; // Y offset from drag (carries inertia)
  private userTilt = 0; // X offset from drag (snaps back to neutral)
  private vel = 0; // angular velocity for inertia
  private idle = 0; // idle auto-spin accumulator (pauses while interacting)

  // --- T14 fabric morph targets ---
  private colorTarget = new THREE.Color();
  private emissiveTarget = new THREE.Color();
  private sheenColorTarget = new THREE.Color();
  private roughTarget = 0.5;
  private metalTarget = 0.1;
  private sheenTarget = 0.2;
  private clearcoatTarget = 0.2;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = createRenderer(container);
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    this.camera.position.set(0, 0.2, 5.4);
    this.camera.lookAt(0, 0, 0);

    // --- gown silhouette via LatheGeometry ---
    const profile: THREE.Vector2[] = [
      [0.001, -2.05],
      [1.12, -2.0],
      [0.86, -1.5],
      [0.6, -1.0],
      [0.42, -0.5],
      [0.34, -0.1],
      [0.46, 0.3],
      [0.4, 0.6],
      [0.34, 0.9],
      [0.16, 1.1],
      [0.14, 1.2],
      [0.001, 1.25],
    ].map(([x, y]) => new THREE.Vector2(x, y));

    const geo = new THREE.LatheGeometry(profile, capabilities.lowPower ? 40 : 72);
    geo.computeVertexNormals();

    const f0 = fabrics[0];
    this.shadedMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(f0.hex),
      roughness: f0.roughness,
      metalness: f0.metalness,
      sheen: f0.sheen,
      sheenColor: new THREE.Color(f0.hex).lerp(WHITE, 0.5),
      clearcoat: f0.clearcoat,
      clearcoatRoughness: 0.3,
      emissive: new THREE.Color(f0.hex).multiplyScalar(0.12),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.setFabric(f0); // seed morph targets = initial (no jump)
    this.shaded = new THREE.Mesh(geo, this.shadedMat);

    this.wireMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#7df9ff'),
      transparent: true,
      opacity: 0.9,
    });
    this.wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), this.wireMat);

    this.garment.add(this.shaded, this.wire);
    this.garment.position.y = 0.1;
    this.scene.add(this.garment);

    // --- lights ---
    this.scene.add(new THREE.AmbientLight(0x2a3550, 0.7));
    const key = new THREE.DirectionalLight(0xbcd8ff, 1.6);
    key.position.set(2, 3, 4);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x3aa0ff, 2.2);
    rim.position.set(-3, 1, -3);
    this.scene.add(rim);
    const fill = new THREE.PointLight(0xb46cff, 8, 20);
    fill.position.set(-2, -1, 2);
    this.scene.add(fill);

    // --- drag listeners (pointerdown on canvas, move/up on window so the
    //     drag continues even if the pointer leaves the stage) ---
    this.renderer.domElement.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    // --- swatch events from the DesignIO section (T14) ---
    document.addEventListener('lz:fabric', this.onFabric as EventListener);
  }

  // ---- T13 drag ----
  private onDown = (e: PointerEvent): void => {
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.vel = 0;
    this.container.classList.add('is-grabbing');
  };

  private onMove = (e: PointerEvent): void => {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    const d = dx * 0.009;
    this.userRot += d;
    this.vel = d;
    this.userTilt = THREE.MathUtils.clamp(this.userTilt + dy * 0.004, -0.5, 0.5);
  };

  private onUp = (): void => {
    if (!this.dragging) return;
    this.dragging = false;
    this.container.classList.remove('is-grabbing');
  };

  // ---- T14 fabric ----
  private onFabric = (e: CustomEvent<number>): void => {
    const f = fabrics[e.detail];
    if (f) this.setFabric(f);
  };

  setFabric(f: Fabric): void {
    this.colorTarget.set(f.hex);
    this.emissiveTarget.set(f.hex).multiplyScalar(0.12);
    this.sheenColorTarget.set(f.hex).lerp(WHITE, 0.5);
    this.roughTarget = f.roughness;
    this.metalTarget = f.metalness;
    this.sheenTarget = f.sheen;
    this.clearcoatTarget = f.clearcoat;
  }

  /** 0..1 scroll progress through the DesignIO section. */
  setProgress(p: number): void {
    this.progress = THREE.MathUtils.clamp(p, 0, 1);
  }

  update(dt: number, elapsed: number): void {
    // Reveal shaded over the first 45% of scroll (or immediately if reduced motion).
    const targetReveal = capabilities.reducedMotion
      ? 1
      : THREE.MathUtils.smoothstep(this.progress, 0.0, 0.45);
    this.reveal += (targetReveal - this.reveal) * Math.min(1, dt * 4);
    this.shadedMat.opacity = this.reveal;
    this.wireMat.opacity = 0.9 * (1 - this.reveal * 0.82);

    // --- T14: ease the material toward the selected fabric ---
    const mk = Math.min(1, dt * 5);
    const m = this.shadedMat;
    m.color.lerp(this.colorTarget, mk);
    m.emissive.lerp(this.emissiveTarget, mk);
    m.sheenColor.lerp(this.sheenColorTarget, mk);
    m.roughness += (this.roughTarget - m.roughness) * mk;
    m.metalness += (this.metalTarget - m.metalness) * mk;
    m.sheen += (this.sheenTarget - m.sheen) * mk;
    m.clearcoat += (this.clearcoatTarget - m.clearcoat) * mk;

    // --- T13: drag inertia (Y) + snap-back (X); idle spin pauses while
    //     interacting and resumes only once the fling has settled. ---
    const k = Math.min(3, dt * 60);
    if (!this.dragging) {
      this.userRot += this.vel * k;
      this.vel *= Math.pow(0.94, k);
      if (Math.abs(this.vel) < 0.0002) this.vel = 0;
      this.userTilt *= Math.pow(0.86, k); // ease tilt back to neutral
    }
    const idleActive = !this.dragging && this.vel === 0;
    this.idle += (idleActive ? 0.25 : 0) * dt;

    this.garment.rotation.y = this.progress * Math.PI * 1.4 + this.idle + this.userRot;
    this.garment.rotation.x = Math.sin(elapsed * 0.4) * 0.04 + this.userTilt;

    this.renderer.render(this.scene, this.camera);
  }

  resize(w: number, h: number): void {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose(): void {
    this.renderer.domElement.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    document.removeEventListener('lz:fabric', this.onFabric as EventListener);
    this.renderer.dispose();
    this.shaded.geometry.dispose();
    this.shadedMat.dispose();
    this.wire.geometry.dispose();
    this.wireMat.dispose();
    this.renderer.domElement.remove();
  }
}
