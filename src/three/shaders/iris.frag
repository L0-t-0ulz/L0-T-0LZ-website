precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uPupil;     // pupil offset in centered space (~[-0.18, 0.18])
uniform vec3 uColor;     // primary blue
uniform vec3 uAccent;    // cyan / bright
uniform float uIntensity;

#define PI 3.14159265359

void main() {
  vec2 p = (vUv - 0.5) * 2.0;   // -1..1, edge at r = 1
  float r = length(p);
  float a = atan(p.y, p.x);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  // --- iris base wash ---
  float base = smoothstep(1.0, 0.15, r);
  col += uColor * 0.10 * base;
  alpha = max(alpha, base * 0.35);

  // --- concentric HUD rings, pulsing inward ---
  float rings = 0.5 + 0.5 * sin(r * 34.0 - uTime * 1.6);
  rings = smoothstep(0.55, 1.0, rings) * smoothstep(1.0, 0.82, r) * smoothstep(0.12, 0.2, r);
  col += mix(uColor, uAccent, r) * rings * 0.7;
  alpha = max(alpha, rings * 0.85);

  // --- radial tick marks in a mid band ---
  float ticks = step(0.82, fract(a / PI * 24.0));
  float tickBand = smoothstep(0.70, 0.72, r) - smoothstep(0.80, 0.82, r);
  col += uAccent * ticks * tickBand;
  alpha = max(alpha, ticks * tickBand);

  // --- rotating radar sweep wedge ---
  float sweepA = mod(-uTime * 0.75, 2.0 * PI) - PI;
  float da = abs(atan(sin(a - sweepA), cos(a - sweepA)));
  float sweep = smoothstep(0.55, 0.0, da) * smoothstep(1.0, 0.15, r) * smoothstep(0.14, 0.22, r);
  col += uAccent * sweep * 0.45;
  alpha = max(alpha, sweep * 0.5);

  // --- crosshair reticle (gap left for the pupil) ---
  float cross = smoothstep(0.010, 0.0, abs(p.x)) + smoothstep(0.010, 0.0, abs(p.y));
  cross *= smoothstep(1.0, 0.9, r) * smoothstep(0.18, 0.24, r);
  col += uAccent * cross * 0.55;
  alpha = max(alpha, cross * 0.55);

  // --- pupil + inner glow, tracks cursor ---
  float pr = length(p - uPupil);
  float pupil = smoothstep(0.135, 0.09, pr);
  float pupilGlow = smoothstep(0.34, 0.0, pr);
  float innerRing = smoothstep(0.018, 0.0, abs(pr - 0.19));
  col += uColor * pupilGlow * 0.45;
  col += uAccent * innerRing * 0.9;
  col += vec3(1.0) * pupil;
  alpha = max(alpha, pupilGlow * 0.45);
  alpha = max(alpha, innerRing);
  alpha = max(alpha, pupil);

  // --- outer rim ---
  float rim = smoothstep(0.02, 0.0, abs(r - 0.95));
  col += uColor * rim * 0.8;
  alpha = max(alpha, rim);

  // fade hard edge
  float edge = smoothstep(1.0, 0.95, r);
  alpha *= edge;

  gl_FragColor = vec4(col * uIntensity, alpha);
}
