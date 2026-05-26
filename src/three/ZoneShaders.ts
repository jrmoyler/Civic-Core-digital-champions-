// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Zone Background Shaders
// GLSL vertex + fragment shaders for the Three.js parallax layers.
// Each zone has 3 depth layers: far / mid / near.
// ============================================================

import type { ZoneId } from '../game/types';

export interface LayerShaderConfig {
  vertexShader: string;
  fragmentShader: string;
}

export interface ZoneShaderSet {
  far: LayerShaderConfig;
  mid: LayerShaderConfig;
  near: LayerShaderConfig;
}

// ── Shared vertex shader (all layers) ─────────────────────────
const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ── Zone 1: Digital City / Cyber-civic ────────────────────────
const Z1_FAR_FRAG = /* glsl */`
  uniform float time;
  uniform float scrollOffset;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Deep navy sky gradient
    vec3 col = mix(vec3(0.03, 0.06, 0.18), vec3(0.01, 0.02, 0.08), uv.y);

    // Stars (pseudo-random scatter)
    vec2 sSt = uv * vec2(120.0, 60.0) + vec2(scrollOffset * 0.00002, 0.0);
    vec2 sCell = floor(sSt);
    float sHash = fract(sin(dot(sCell, vec2(127.1, 311.7))) * 43758.5453);
    float star = step(0.97, sHash) * (1.0 - length(fract(sSt) - 0.5) * 4.0);
    col += max(0.0, star) * 0.9;

    // Faint horizon glow
    float hz = exp(-abs(uv.y - 0.55) * 12.0);
    col += hz * vec3(0.05, 0.2, 0.6) * 0.4;

    gl_FragColor = vec4(col, 0.95);
  }
`;

const Z1_MID_FRAG = /* glsl */`
  uniform float time;
  uniform float scrollOffset;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // City skyline procedural silhouette
    float bx = uv.x * 14.0 + scrollOffset * 0.00015;
    float bCell = floor(bx);
    float bH = fract(sin(bCell * 137.4) * 4376.3) * 0.35 + 0.18;
    float building = step(1.0 - bH, uv.y) * step(fract(bx), 0.88);
    vec3 col = building > 0.5 ? vec3(0.04, 0.06, 0.12) : vec3(0.0, 0.0, 0.0);

    // Windows (lit at intervals)
    if (building > 0.5) {
      vec2 win = fract(uv * vec2(60.0, 20.0));
      float litHash = fract(sin(dot(floor(uv * vec2(60.0, 20.0)), vec2(31.7, 71.3))) * 1234.5);
      float lit = step(0.7, litHash) * step(win.x, 0.5) * step(win.y, 0.55);
      col += lit * vec3(0.8, 0.7, 0.3) * 0.6;
    }

    // Scan-line atmosphere
    float scan = step(0.6, fract(uv.y * 120.0 + time * 0.15));
    col *= 1.0 - scan * 0.025;

    gl_FragColor = vec4(col, building > 0.5 ? 0.92 : 0.0);
  }
`;

const Z1_NEAR_FRAG = /* glsl */`
  uniform float time;
  uniform float scrollOffset;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Near-ground grid — perspective lines converging at horizon
    float gridX = fract(uv.x * 18.0 + scrollOffset * 0.0003);
    float gridY = fract(uv.y * 9.0);
    float gLineX = step(0.94, gridX) + step(0.94, 1.0 - gridX);
    float gLineY = step(0.93, gridY);
    float grid = max(gLineX, gLineY);

    // Only show grid below mid-screen
    grid *= step(0.45, uv.y);
    float gridFade = smoothstep(0.45, 0.75, uv.y);

    vec3 col = grid * vec3(0.1, 0.35, 0.85) * gridFade * 0.55;

    // Pulse on grid lines over time
    col *= 1.0 + 0.3 * sin(time * 1.2 + uv.x * 8.0);

    gl_FragColor = vec4(col, grid * gridFade * 0.7);
  }
`;

// ── Zone 2: Digital Wilderness / Forest ───────────────────────
const Z2_FAR_FRAG = /* glsl */`
  uniform float time;
  uniform float scrollOffset;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;

    // Dark forest gradient sky
    vec3 col = mix(vec3(0.04, 0.12, 0.05), vec3(0.01, 0.04, 0.02), uv.y);

    // Moon / orb glow
    vec2 moonPos = vec2(0.78, 0.22);
    float moon = exp(-length((uv - moonPos) * vec2(1.0, 1.2)) * 18.0);
    col += moon * vec3(0.5, 0.75, 0.5) * 0.6;

    // Firefly particles
    vec2 fSt = uv * vec2(25.0, 12.0) + vec2(-scrollOffset * 0.00005, -time * 0.08);
    vec2 fCell = floor(fSt);
    float fH = hash(fCell);
    float firefly = step(0.92, fH) * (1.0 - length(fract(fSt) - 0.5) * 3.5);
    float flicker = 0.5 + 0.5 * sin(time * 3.0 + fH * 20.0);
    col += max(0.0, firefly) * vec3(0.3, 1.0, 0.4) * flicker * 0.7;

    gl_FragColor = vec4(col, 0.94);
  }
`;

const Z2_MID_FRAG = /* glsl */`
  uniform float time;
  uniform float scrollOffset;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;

    // Distant tree silhouettes
    float tx = uv.x * 10.0 + scrollOffset * 0.00012;
    float tCell = floor(tx);
    float tWidth = hash(vec2(tCell, 0.0)) * 0.25 + 0.08;
    float tHeight = hash(vec2(tCell, 1.0)) * 0.4 + 0.25;
    float tFract = fract(tx);
    float trunk = step(0.5 - tWidth * 0.2, tFract) * step(tFract, 0.5 + tWidth * 0.2);
    float crown = step(0.5 - tWidth, tFract) * step(tFract, 0.5 + tWidth);
    float treeH = trunk * step(1.0 - tHeight * 0.6, uv.y)
                + crown * step(1.0 - tHeight, uv.y) * step(uv.y, 1.0 - tHeight * 0.55);
    float alpha = treeH * smoothstep(0.0, 0.1, uv.y);

    vec3 col = vec3(0.02, 0.06, 0.02);
    gl_FragColor = vec4(col, alpha * 0.9);
  }
`;

const Z2_NEAR_FRAG = /* glsl */`
  uniform float time;
  uniform float scrollOffset;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;

    // Falling leaves
    vec2 lSt = uv * vec2(18.0, 10.0) + vec2(-scrollOffset * 0.0002, -time * 0.25);
    vec2 lCell = floor(lSt);
    vec2 lFract = fract(lSt);
    float lH = hash(lCell);
    float leaf = step(0.88, lH) * (1.0 - length(lFract - vec2(0.5 + sin(time * lH) * 0.15, 0.5)) * 4.5);
    leaf = max(0.0, leaf);
    float leafAlpha = leaf * (0.4 + 0.3 * sin(time * 2.0 + lH * 10.0));

    // Low mist band
    float mist = exp(-abs(uv.y - 0.82) * 14.0) * 0.18;
    vec3 col = leaf > 0.01
      ? mix(vec3(0.2, 0.6, 0.1), vec3(0.5, 0.8, 0.2), lH)
      : vec3(0.3, 0.5, 0.3) * mist;

    gl_FragColor = vec4(col, leafAlpha + mist * 0.5);
  }
`;

// ── Zone 3: Digital Space / Nexus ─────────────────────────────
const Z3_FAR_FRAG = /* glsl */`
  uniform float time;
  uniform float scrollOffset;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;

    // Deep space base
    vec3 col = mix(vec3(0.02, 0.0, 0.06), vec3(0.005, 0.0, 0.02), uv.y);

    // Stars
    vec2 sSt = uv * vec2(90.0, 45.0) + vec2(scrollOffset * 0.00001, 0.0);
    vec2 sCell = floor(sSt);
    float sH = hash(sCell);
    float star = step(0.96, sH) * (1.0 - length(fract(sSt) - 0.5) * 5.0);
    float twinkle = 0.7 + 0.3 * sin(time * (2.0 + sH * 4.0));
    col += max(0.0, star) * twinkle;

    // Nebula clouds
    vec2 n1 = uv - vec2(0.25, 0.35);
    col += exp(-dot(n1, n1) * 8.0) * vec3(0.15, 0.0, 0.4) * 0.5;
    vec2 n2 = uv - vec2(0.75, 0.6);
    col += exp(-dot(n2, n2) * 12.0) * vec3(0.0, 0.05, 0.3) * 0.4;

    gl_FragColor = vec4(col, 0.97);
  }
`;

const Z3_MID_FRAG = /* glsl */`
  uniform float time;
  uniform float scrollOffset;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;

    // Digital code rain (vertical streams)
    float col_x = floor(uv.x * 28.0 + scrollOffset * 0.0001);
    float spd = hash(vec2(col_x, 0.5)) * 0.4 + 0.15;
    float rainY = fract(uv.y * 14.0 + time * spd + hash(vec2(col_x, 1.0)));
    float litChar = hash(vec2(col_x, floor(uv.y * 14.0)));
    float rain = step(0.8, litChar) * max(0.0, 1.0 - rainY * 2.5);
    float trailFade = smoothstep(0.0, 0.4, rainY);
    rain *= trailFade;

    vec3 col = rain * mix(vec3(0.6, 0.0, 0.9), vec3(0.9, 0.5, 1.0), rainY);
    gl_FragColor = vec4(col, rain * 0.7);
  }
`;

const Z3_NEAR_FRAG = /* glsl */`
  uniform float time;
  uniform float scrollOffset;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Hexagonal energy grid
    vec2 hUv = (uv * vec2(20.0, 11.0)) + vec2(scrollOffset * 0.0003, 0.0);
    vec2 hCell = floor(hUv);
    vec2 hFract = fract(hUv) - 0.5;
    float hex = max(abs(hFract.x) * 1.15 + abs(hFract.y), abs(hFract.y) * 2.0);
    float hexEdge = smoothstep(0.45, 0.5, hex);
    float pulse = 0.5 + 0.5 * sin(time * 0.8 + hCell.x * 0.5 + hCell.y * 0.7);
    float alpha = hexEdge * pulse * smoothstep(0.35, 0.8, uv.y);

    vec3 col = mix(vec3(0.2, 0.0, 0.5), vec3(0.5, 0.0, 0.9), pulse);
    gl_FragColor = vec4(col, alpha * 0.5);
  }
`;

// ── Export map ─────────────────────────────────────────────────
export const ZONE_SHADERS: Record<ZoneId, ZoneShaderSet> = {
  zone1: {
    far:  { vertexShader: VERT, fragmentShader: Z1_FAR_FRAG },
    mid:  { vertexShader: VERT, fragmentShader: Z1_MID_FRAG },
    near: { vertexShader: VERT, fragmentShader: Z1_NEAR_FRAG },
  },
  zone2: {
    far:  { vertexShader: VERT, fragmentShader: Z2_FAR_FRAG },
    mid:  { vertexShader: VERT, fragmentShader: Z2_MID_FRAG },
    near: { vertexShader: VERT, fragmentShader: Z2_NEAR_FRAG },
  },
  zone3: {
    far:  { vertexShader: VERT, fragmentShader: Z3_FAR_FRAG },
    mid:  { vertexShader: VERT, fragmentShader: Z3_MID_FRAG },
    near: { vertexShader: VERT, fragmentShader: Z3_NEAR_FRAG },
  },
};
