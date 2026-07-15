precision highp float;

varying vec2 vUv;

uniform vec3 uCore;     // blue core
uniform vec3 uHalo;     // magenta halo
uniform float uTime;
uniform float uIntensity;

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p);

  // gentle breathing
  float breathe = 0.92 + 0.08 * sin(uTime * 0.9);

  float core = smoothstep(0.6, 0.0, r);
  float halo = smoothstep(1.0, 0.0, r);

  vec3 col = uCore * core * 0.9 + uHalo * (halo - core) * 0.6;
  float alpha = halo * breathe;

  gl_FragColor = vec4(col * uIntensity, alpha * 0.9);
}
