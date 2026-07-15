precision mediump float;

uniform vec3 uColor;
varying float vAlpha;

void main() {
  // soft round point
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
  gl_FragColor = vec4(uColor, alpha * 0.7);
}
