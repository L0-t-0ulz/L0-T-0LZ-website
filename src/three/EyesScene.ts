/* ============================================================
   Hero — two glowing HUD eyes that track the cursor, + particles + bloom.
   ============================================================ */
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect } from 'postprocessing';
import { createRenderer, type Loopable } from '../core/renderer';
import { capabilities } from '../core/capabilities';
import { getMood } from '../core/intruder';
import irisVert from './shaders/iris.vert?raw';
import irisFrag from './shaders/iris.frag?raw';
import glowFrag from './shaders/glow.frag?raw';
import particlesVert from './shaders/particles.vert?raw';
import particlesFrag from './shaders/particles.frag?raw';

const BLUE = new THREE.Color('#3aa0ff');
const CYAN = new THREE.Color('#7df9ff');
const MAGENTA = new THREE.Color('#b46cff');

// INTRUDER mode (T26) palette.
const RED = new THREE.Color('#ff2d55');
const RED_ACCENT = new THREE.Color('#ff7a3a');

interface Eye {
  group: THREE.Group;
  irisMat: THREE.ShaderMaterial;
  glowMat: THREE.ShaderMaterial;
  pupil: THREE.Vector2;
  target: THREE.Vector2;
  worldX: number;
}

export class EyesScene implements Loopable {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private group = new THREE.Group();
  private eyes: Eye[] = [];
  private particles?: THREE.Points;
  private particleMat?: THREE.ShaderMaterial;

  private mouse = new THREE.Vector2(0, 0);
  private smoothParallax = new THREE.Vector2(0, 0);
  private ray = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private hit = new THREE.Vector3();

  private nextBlink = 3;
  private blink = 1; // 1 open, 0 closed
  private blinking = false;
  private blinkT = 0;

  constructor(container: HTMLElement) {
    this.renderer = createRenderer(container);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 6);

    this.buildEyes();
    if (!capabilities.lowPower) this.buildParticles();
    this.scene.add(this.group);
    this.fit();

    // Post-processing (skip heavy bloom on low-power devices).
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new BloomEffect({
      intensity: capabilities.lowPower ? 0.5 : 1.0,
      luminanceThreshold: 0.55,
      luminanceSmoothing: 0.4,
      mipmapBlur: true,
      radius: 0.7,
    });
    this.composer.addPass(new EffectPass(this.camera, bloom));

    window.addEventListener('pointermove', this.onPointer, { passive: true });
    document.addEventListener('lz:mood', this.onMood as EventListener);
    this.setMood(getMood()); // sync if intruder mode was already active
  }

  private onMood = (e: CustomEvent<{ mode: 'normal' | 'intruder' }>): void => {
    this.setMood(e.detail.mode);
  };

  setMood(mode: 'normal' | 'intruder'): void {
    const intruder = mode === 'intruder';
    const color = intruder ? RED : BLUE;
    const accent = intruder ? RED_ACCENT : CYAN;
    const halo = intruder ? RED : MAGENTA;
    for (const eye of this.eyes) {
      (eye.irisMat.uniforms.uColor.value as THREE.Color).copy(color);
      (eye.irisMat.uniforms.uAccent.value as THREE.Color).copy(accent);
      (eye.glowMat.uniforms.uCore.value as THREE.Color).copy(color);
      (eye.glowMat.uniforms.uHalo.value as THREE.Color).copy(halo);
    }
    if (this.particleMat) {
      (this.particleMat.uniforms.uColor.value as THREE.Color).copy(intruder ? RED_ACCENT : CYAN);
    }
  }

  private makeEye(worldX: number): Eye {
    const g = new THREE.Group();
    g.position.x = worldX;

    // glow backplate (behind)
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: irisVert,
      fragmentShader: glowFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uCore: { value: BLUE.clone() },
        uHalo: { value: MAGENTA.clone() },
        uIntensity: { value: 0.9 },
      },
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), glowMat);
    glow.position.z = -0.25;
    g.add(glow);

    // iris (front)
    const irisMat = new THREE.ShaderMaterial({
      vertexShader: irisVert,
      fragmentShader: irisFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPupil: { value: new THREE.Vector2(0, 0) },
        uColor: { value: BLUE.clone() },
        uAccent: { value: CYAN.clone() },
        uIntensity: { value: 1.0 },
      },
    });
    const iris = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), irisMat);
    g.add(iris);

    return {
      group: g,
      irisMat,
      glowMat,
      pupil: new THREE.Vector2(0, 0),
      target: new THREE.Vector2(0, 0),
      worldX,
    };
  }

  private buildEyes(): void {
    const sep = 1.25;
    [-sep, sep].forEach((x) => {
      const eye = this.makeEye(x);
      this.eyes.push(eye);
      this.group.add(eye.group);
    });
  }

  private buildParticles(): void {
    const count = capabilities.lowPower ? 600 : 1800;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    // Deterministic pseudo-random (no Math.random in scripts is fine here — this is app code)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      scales[i] = Math.random() * 0.9 + 0.2;
      speeds[i] = Math.random() * 0.6 + 0.15;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

    this.particleMat = new THREE.ShaderMaterial({
      vertexShader: particlesVert,
      fragmentShader: particlesFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 26 },
        uParallax: { value: new THREE.Vector2(0, 0) },
        uColor: { value: CYAN.clone() },
      },
    });
    this.particles = new THREE.Points(geo, this.particleMat);
    this.scene.add(this.particles);
  }

  private onPointer = (e: PointerEvent) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  /** Scale the eye group so both eyes fit comfortably on narrow viewports. */
  private fit(): void {
    const aspect = this.camera.aspect;
    const s = Math.min(1, aspect / 1.15);
    this.group.scale.setScalar(THREE.MathUtils.clamp(s, 0.52, 1));
  }

  update(dt: number, elapsed: number): void {
    // Cursor target on the z=0 plane.
    this.ray.setFromCamera(this.mouse, this.camera);
    this.ray.ray.intersectPlane(this.plane, this.hit);

    // Blink scheduling.
    if (!this.blinking && elapsed > this.nextBlink) {
      this.blinking = true;
      this.blinkT = 0;
    }
    if (this.blinking) {
      this.blinkT += dt;
      const d = 0.32;
      const p = Math.min(1, this.blinkT / d);
      // down then up
      this.blink = Math.abs(p - 0.5) * 2 * 0.94 + 0.06;
      if (p >= 1) {
        this.blinking = false;
        this.blink = 1;
        this.nextBlink = elapsed + 3.5 + Math.random() * 3.5;
      }
    }

    for (const eye of this.eyes) {
      // per-eye convergence toward the cursor hit point
      const dx = this.hit.x - eye.worldX * this.group.scale.x;
      const dy = this.hit.y;
      eye.target.set(
        THREE.MathUtils.clamp(dx * 0.09, -0.17, 0.17),
        THREE.MathUtils.clamp(dy * 0.09, -0.17, 0.17)
      );
      eye.pupil.lerp(eye.target, 1 - Math.pow(0.0015, dt));
      eye.irisMat.uniforms.uPupil.value.copy(eye.pupil);
      eye.irisMat.uniforms.uTime.value = elapsed;
      eye.glowMat.uniforms.uTime.value = elapsed;
      eye.group.scale.y = this.blink;
    }

    // subtle group parallax + particle parallax
    this.smoothParallax.lerp(this.mouse, 1 - Math.pow(0.02, dt));
    this.group.rotation.y = this.smoothParallax.x * 0.12;
    this.group.rotation.x = -this.smoothParallax.y * 0.08;
    if (this.particleMat) {
      this.particleMat.uniforms.uTime.value = elapsed;
      this.particleMat.uniforms.uParallax.value.set(
        this.smoothParallax.x * 0.25,
        this.smoothParallax.y * 0.25
      );
    }

    this.composer.render(dt);
  }

  resize(w: number, h: number): void {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.fit();
  }

  dispose(): void {
    window.removeEventListener('pointermove', this.onPointer);
    document.removeEventListener('lz:mood', this.onMood as EventListener);
    this.composer.dispose();
    this.renderer.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    this.renderer.domElement.remove();
  }
}
