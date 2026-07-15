uniform float uTime;
uniform float uSize;
uniform vec2 uParallax;

attribute float aScale;
attribute float aSpeed;

varying float vAlpha;

void main() {
  vec3 pos = position;

  // slow vertical drift + subtle sway
  pos.y += sin(uTime * aSpeed + position.x * 2.0) * 0.15;
  pos.x += cos(uTime * aSpeed * 0.7 + position.y * 2.0) * 0.12;

  // pointer parallax by depth
  pos.xy += uParallax * (pos.z * 0.5 + 1.0);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = uSize * aScale * (300.0 / -mvPosition.z);
  vAlpha = clamp(aScale, 0.15, 1.0);
}
