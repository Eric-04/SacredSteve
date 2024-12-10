// Vertex Shader
export const snowVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
export const snowFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    float glow = abs(sin(time * 2.0 + uv.x * 10.0 + uv.y * 10.0));
    gl_FragColor = vec4(0.5 + 0.5 * glow, 0.1, 0.8 + 0.2 * glow, 1.0);
  }
`;
