/**
 * Hero "noise → structure" point field (vanilla three.js, lazy-loaded).
 *
 * Every point is one "record". It has three precomputed positions:
 *   0. noise   – scattered raw extract; ~12% of records are invalid (red)
 *   1. cluster – grouped by k-means-style clusters (one cluster highlighted)
 *   2. grid    – aligned into a loaded table with a highlighted header row
 * The GPU blends between them from a single `uStage` uniform (0 → 2), with a
 * per-point stagger. Moving the pointer "dirties" nearby records: they push
 * away and turn red, then settle back into place.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

export type Stage = 0 | 1 | 2;

export interface FieldStats {
  records: number;
  invalid: number;
  clusters: number;
}

export interface FieldOptions {
  canvas: HTMLCanvasElement;
  /** Element that receives pointer movement (the hero section). */
  pointerTarget: HTMLElement;
  onStage?: (stage: Stage) => void;
  onReady?: () => void;
}

export interface FieldHandle {
  stats: FieldStats;
  replay: () => void;
}

/* ── layout constants (field units) ─────────────────────────────── */
const FIELD_W = 12;
const FIELD_H = 7;
const CLUSTERS = 5;
const INVALID_RATIO = 0.12;

/* ── timeline (seconds) ─────────────────────────────────────────── */
const HOLD_NOISE = 1.4;
const TO_CLUSTER = 2.4;
const HOLD_CLUSTER = 1.8;
const TO_GRID = 2.6;

function stageAt(t: number): number {
  let s = t - HOLD_NOISE;
  if (s <= 0) return 0;
  if (s < TO_CLUSTER) return s / TO_CLUSTER;
  s -= TO_CLUSTER;
  if (s < HOLD_CLUSTER) return 1;
  s -= HOLD_CLUSTER;
  return Math.min(2, 1 + s / TO_GRID);
}

/** Deterministic PRNG so the field looks the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildRecords(cols: number, rows: number) {
  const count = cols * rows;
  const rand = mulberry32(57);
  const gauss = () => {
    const u = Math.max(rand(), 1e-6);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };

  const noise = new Float32Array(count * 3);
  const cluster = new Float32Array(count * 3);
  const grid = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const dirty = new Float32Array(count);
  const lime = new Float32Array(count);
  const header = new Float32Array(count);

  // Cluster centres spread across the field, one highlighted (index 0).
  const centres = [
    [-2.6, 1.1, 0.4],
    [-0.6, -1.6, -0.6],
    [2.4, 1.6, 0.2],
    [4.2, -1.4, -0.3],
    [0.8, 0.4, 1.0],
  ];
  const spread = [0.75, 0.9, 0.7, 0.8, 0.6];

  // Grid: columns grouped into "fields" with wider gaps between groups.
  const groupEvery = Math.max(4, Math.round(cols / 6));
  const groups = Math.ceil(cols / groupEvery) - 1;
  const cell = FIELD_W / (cols + groups * 0.9);
  const gridW = cell * (cols - 1 + groups * 0.9);
  const rowH = FIELD_H / (rows + 0.8);
  const gridH = rowH * (rows - 1 + 0.8);

  let invalid = 0;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    noise[i3] = (rand() - 0.5) * (FIELD_W + 1.5);
    noise[i3 + 1] = (rand() - 0.5) * (FIELD_H + 1);
    noise[i3 + 2] = (rand() - 0.5) * 4;

    const k = Math.floor(rand() * CLUSTERS);
    const c = centres[k]!;
    cluster[i3] = c[0]! + gauss() * spread[k]!;
    cluster[i3 + 1] = c[1]! + gauss() * spread[k]! * 0.8;
    cluster[i3 + 2] = c[2]! + gauss() * 0.5;
    lime[i] = k === 0 ? 1 : 0;

    const col = i % cols;
    const row = Math.floor(i / cols);
    const groupGap = Math.floor(col / groupEvery) * 0.9 * cell;
    grid[i3] = col * cell + groupGap - gridW / 2;
    grid[i3 + 1] = gridH / 2 - (row * rowH + (row > 0 ? 0.8 * rowH : 0));
    grid[i3 + 2] = 0;
    header[i] = row === 0 ? 1 : 0;

    seed[i] = rand();
    if (rand() < INVALID_RATIO) {
      dirty[i] = 1;
      invalid++;
    }
  }

  const geometry = new BufferGeometry();
  // `position` is required by three for bounds; the shader uses the named attributes.
  geometry.setAttribute('position', new BufferAttribute(grid, 3));
  geometry.setAttribute('aNoise', new BufferAttribute(noise, 3));
  geometry.setAttribute('aCluster', new BufferAttribute(cluster, 3));
  geometry.setAttribute('aGrid', new BufferAttribute(grid, 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 1));
  geometry.setAttribute('aDirty', new BufferAttribute(dirty, 1));
  geometry.setAttribute('aLime', new BufferAttribute(lime, 1));
  geometry.setAttribute('aHeader', new BufferAttribute(header, 1));

  return { geometry, stats: { records: count, invalid, clusters: CLUSTERS } };
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uStage;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uPointer;
  uniform vec2 uPointerPos;

  attribute vec3 aNoise;
  attribute vec3 aCluster;
  attribute vec3 aGrid;
  attribute float aSeed;
  attribute float aDirty;
  attribute float aLime;
  attribute float aHeader;

  varying float vDirty;
  varying float vLime;
  varying float vAlpha;

  float ease(float t) { return t * t * (3.0 - 2.0 * t); }

  void main() {
    float s1 = ease(clamp((uStage - aSeed * 0.35) / 0.65, 0.0, 1.0));
    float s2 = ease(clamp((uStage - 1.0 - aSeed * 0.35) / 0.65, 0.0, 1.0));

    vec3 jitter = vec3(
      sin(uTime * 0.9 + aSeed * 40.0),
      cos(uTime * 0.7 + aSeed * 25.0),
      sin(uTime * 0.5 + aSeed * 13.0)
    );

    vec3 p = mix(aNoise + jitter * 0.22, aCluster + jitter * 0.07, s1);
    p = mix(p, aGrid + jitter * 0.006, s2);

    // Pointer disturbance: nearby records get pushed and turn "dirty".
    vec2 d = p.xy - uPointerPos;
    float push = exp(-dot(d, d) / 1.1) * uPointer;
    p.xy += normalize(d + 1e-4) * push * 0.85;
    p.z += push * 1.4;

    vDirty = max(aDirty * (1.0 - s1), push);
    vLime = aLime * s1 * (1.0 - s2) + aHeader * s2;
    vAlpha = mix(0.5 + aSeed * 0.5, 0.9, s2);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 + push * 0.9) * uPixelRatio * (10.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uFg;
  uniform vec3 uClean;
  uniform vec3 uDirty;
  uniform float uOpacity;

  varying float vDirty;
  varying float vLime;
  varying float vAlpha;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.32, r);
    vec3 col = mix(uFg, uClean, clamp(vLime, 0.0, 1.0));
    col = mix(col, uDirty, clamp(vDirty, 0.0, 1.0));
    gl_FragColor = vec4(col, edge * vAlpha * uOpacity);
  }
`;

function cssColor(name: string): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value || '#ffffff');
}

export function createField({
  canvas,
  pointerTarget,
  onStage,
  onReady,
}: FieldOptions): FieldHandle {
  const small = window.matchMedia('(max-width: 767px)').matches;
  const [cols, rows] = small ? [30, 28] : [48, 36];
  const { geometry, stats } = buildRecords(cols, rows);

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uStage: { value: 0 },
      uSize: { value: small ? 4.6 : 5.2 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uPointer: { value: 0 },
      uPointerPos: { value: new Vector2(99, 99) },
      uFg: { value: new Color() },
      uClean: { value: new Color() },
      uDirty: { value: new Color() },
      uOpacity: { value: small ? 0.55 : 0.9 },
    },
  });

  const points = new Points(geometry, material);
  scene.add(points);

  /* Theme: read the same CSS tokens as the rest of the site. */
  const applyTheme = () => {
    material.uniforms.uFg!.value = cssColor('--c-fg');
    material.uniforms.uClean!.value = cssColor('--c-clean');
    material.uniforms.uDirty!.value = cssColor('--c-dirty');
    // Light points on dark paper read best additive; dark points on light paper need normal.
    material.blending =
      document.documentElement.dataset.theme === 'light' ? NormalBlending : AdditiveBlending;
    material.needsUpdate = true;
  };
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  /* Layout: field sits right of the headline on desktop, above it on mobile. */
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const visW = visH * camera.aspect;
    if (w >= 768) {
      const scale = Math.min((visW * 0.44) / FIELD_W, (visH * 0.56) / FIELD_H);
      points.scale.setScalar(scale);
      points.position.set(visW * 0.255, visH * 0.08, 0);
    } else {
      const scale = Math.min((visW * 0.9) / FIELD_W, (visH * 0.34) / FIELD_H);
      points.scale.setScalar(scale);
      points.position.set(0, visH * 0.27, 0);
    }
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* Pointer: track over the whole hero; project onto the z = 0 plane in field space. */
  const ndc = new Vector2();
  const world = new Vector3();
  let pointerEnergy = 0;
  let pointerActive = false;
  pointerTarget.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    world.set(ndc.x, ndc.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const t = -camera.position.z / world.z;
    world.multiplyScalar(t).add(camera.position).sub(points.position).divideScalar(points.scale.x);
    material.uniforms.uPointerPos!.value.set(world.x, world.y);
    pointerActive = true;
  });
  pointerTarget.addEventListener('pointerleave', () => (pointerActive = false));

  /* Loop: only runs while the hero is on screen and the tab is visible. */
  let elapsed = 0;
  let last = performance.now();
  let raf = 0;
  let visible = true;
  let currentStage: Stage | -1 = -1;
  let ready = false;

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;

    const stage = stageAt(elapsed);
    material.uniforms.uTime!.value = elapsed;
    material.uniforms.uStage!.value = stage;

    pointerEnergy +=
      ((pointerActive ? 1 : 0) - pointerEnergy) * Math.min(1, dt * (pointerActive ? 6 : 1.5));
    pointerActive = false; // decays unless the pointer keeps moving
    material.uniforms.uPointer!.value = pointerEnergy;

    const named: Stage = stage < 0.5 ? 0 : stage < 1.5 ? 1 : 2;
    if (named !== currentStage) {
      currentStage = named;
      onStage?.(named);
    }

    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      onReady?.();
    }
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    if (visible) start();
    else stop();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();

  return {
    stats,
    replay: () => {
      elapsed = 0;
      currentStage = -1;
      start();
    },
  };
}
