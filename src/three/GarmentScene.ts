/* ============================================================
   DesignIO stage — a procedural gown that reveals wireframe -> shaded
   and rotates with scroll. No external model.
   ============================================================ */
import * as THREE from 'three';
import { createRenderer, type Loopable } from '../core/renderer';
import { capabilities } from '../core/capabilities';

export class GarmentScene implements Loopable {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private garment = new THREE.Group();
  private shaded: THREE.Mesh;
  private wire: THREE.LineSegments;
  private shadedMat: THREE.MeshStandardMaterial;
  private wireMat: THREE.LineBasicMaterial;

  private progress = 0; // 0..1 from ScrollTrigger
  private reveal = 0; // eased wireframe->shaded

  constructor(container: HTMLElement) {
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

    this.shadedMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#16233d'),
      roughness: 0.55,
      metalness: 0.15,
      emissive: new THREE.Color('#0a1830'),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
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

    // Idle spin + scroll-scrubbed rotation.
    const spin = elapsed * 0.25 + this.progress * Math.PI * 1.4;
    this.garment.rotation.y = spin;
    this.garment.rotation.x = Math.sin(elapsed * 0.4) * 0.04;

    this.renderer.render(this.scene, this.camera);
  }

  resize(w: number, h: number): void {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose(): void {
    this.renderer.dispose();
    this.shaded.geometry.dispose();
    this.shadedMat.dispose();
    this.wire.geometry.dispose();
    this.wireMat.dispose();
    this.renderer.domElement.remove();
  }
}
