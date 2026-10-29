import { type FieldGenerator, runGenerator } from './generators.js';
import { buildNoiseTable, type NoiseMode } from './noise.js';
import { BAYER, type FieldTheme, resolvePalette } from './palette.js';
import { type FieldPreset, PRESETS } from './presets.js';

export type { FieldGenerator } from './generators.js';
export { GENERATOR_NAMES } from './generators.js';
export type { NoiseMode } from './noise.js';
export type { FieldTheme, Rgba } from './palette.js';
export { DARK_PALETTE, LIGHT_PALETTE, packPalette, paletteFromTint } from './palette.js';
export type { FieldFalloff, FieldPreset, PresetShape } from './presets.js';
export { PRESET_NAMES, PRESETS, PRESETS_BY_GENERATOR } from './presets.js';

import type { FieldFalloff } from './presets.js';

export interface FieldOptions {
  preset?: FieldPreset;
  generator?: FieldGenerator;
  falloff?: FieldFalloff;
  mode?: NoiseMode;
  seed?: number;
  scale?: number;
  aspect?: number;
  warp?: number;
  contrast?: number;
  speed?: number;
  flow?: { x: number; y: number };
  intensity?: number;
  theme?: FieldTheme;
  tint?: string;
  palette?: Uint32Array;
  interactive?: boolean;
  playing?: boolean;
  fps?: number;
}

export interface FieldHandle {
  update(next: FieldOptions): void;
  destroy(): void;
}

interface Config {
  generator: FieldGenerator;
  falloff: FieldFalloff;
  mode: NoiseMode;
  seed: number;
  scale: number;
  aspect: number;
  warp: number;
  contrast: number;
  speed: number;
  flow: { x: number; y: number };
  intensity: number;
  theme: FieldTheme;
  tint?: string;
  palette?: Uint32Array;
  interactive: boolean;
  playing: boolean;
  fps: number;
}

const BASE: Config = {
  ...PRESETS.clouds,
  seed: 0,
  theme: 'dark',
  interactive: true,
  playing: true,
  fps: 24,
};

const MAX_PIXEL_SCALE_WIDTH = 760;
const FIELD_STRIDE = 4;
const GLOW_RADIUS_RATIO = 0.1;
const GLOW_PEAK_RATIO = 0.5;
const GLOW_EASING = 0.05;
const MAX_TIME_STEP = 0.1;

let sharedTables: { warp: Float32Array; shape: Float32Array } | null = null;

function resolveConfig(current: Config, next: FieldOptions): Config {
  const base = next.preset ? { ...current, ...PRESETS[next.preset] } : current;
  const merged = { ...base };
  for (const [key, value] of Object.entries(next)) {
    if (key !== 'preset' && value !== undefined) {
      Object.assign(merged, { [key]: value });
    }
  }
  return merged;
}

function requireContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('pixelfield: could not acquire a 2d canvas context');
  return ctx;
}

export function createField(canvas: HTMLCanvasElement, options: FieldOptions = {}): FieldHandle {
  const ctx = requireContext(canvas);
  sharedTables ??= { warp: buildNoiseTable(2), shape: buildNoiseTable(1) };
  const tables = sharedTables;

  let config = resolveConfig(BASE, options);
  const motionQuery = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  const pointer = { clientX: 0, clientY: 0, isOver: false, x: 0, y: 0, strength: 0 };

  let palette = config.palette ?? resolvePalette(config.theme, config.tint);
  let maxIndex = palette.length - 1;
  let offsetX = 41.3 * config.seed;
  let offsetY = 67.9 * config.seed;
  let time = 3.7 * config.seed;

  let scale = 2;
  let width = 1;
  let height = 1;
  let gridWidth = 1;
  let gridHeight = 1;
  let image: ImageData | null = null;
  let pixels: Uint32Array = new Uint32Array(1);
  let field: Float32Array = new Float32Array(1);
  let glow: Float32Array = new Float32Array(1);
  let ramp: Float32Array = new Float32Array(1);

  let frameId = 0;
  let lastFrame = 0;
  let isVisible = !globalThis.document?.hidden;

  function buildRamp(): Float32Array {
    return Float32Array.from({ length: height }, (_, y) => {
      const t = config.falloff === 'up' ? 1 - y / height : y / height;
      return config.falloff === 'fill' ? 0.62 + 0.25 * (1 - t) : 1.05 * (1 - t) ** 1.3;
    });
  }

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    scale = Math.max(2, Math.ceil(rect.width / MAX_PIXEL_SCALE_WIDTH));
    width = Math.max(1, Math.ceil(rect.width / scale));
    height = Math.max(1, Math.ceil(rect.height / scale));
    canvas.width = width;
    canvas.height = height;
    image = ctx.createImageData(width, height);
    pixels = new Uint32Array(image.data.buffer);
    gridWidth = Math.floor(width / FIELD_STRIDE) + 2;
    gridHeight = Math.floor(height / FIELD_STRIDE) + 2;
    field = new Float32Array(gridWidth * gridHeight);
    glow = new Float32Array(gridWidth * gridHeight);
    ramp = buildRamp();
  }

  function computeField(): void {
    const step = (256 / (1.1 * width)) * config.scale;
    runGenerator(config.generator, {
      field,
      gridWidth,
      gridHeight,
      stepX: step * config.aspect,
      stepY: step / config.aspect,
      driftX: offsetX + config.flow.x * time,
      driftY: offsetY + config.flow.y * time,
      time,
      scale: config.scale,
      warp: config.warp,
      contrast: config.contrast,
      mode: config.mode,
      tables,
    });
  }

  function computeGlow(): boolean {
    let target = 0;
    if (config.interactive && pointer.isOver) {
      const rect = canvas.getBoundingClientRect();
      const inside =
        pointer.clientX >= rect.left &&
        pointer.clientX <= rect.right &&
        pointer.clientY >= rect.top &&
        pointer.clientY <= rect.bottom;
      if (inside) {
        target = 1;
        pointer.x = (pointer.clientX - rect.left) / scale;
        pointer.y = (pointer.clientY - rect.top) / scale;
      }
    }
    pointer.strength += (target - pointer.strength) * GLOW_EASING;
    if (pointer.strength <= 0.01) return false;

    const sigma = GLOW_RADIUS_RATIO * width;
    const falloff = 1 / (2 * sigma * sigma);
    const peak = GLOW_PEAK_RATIO * pointer.strength * maxIndex;
    for (let gy = 0; gy < gridHeight; gy++) {
      const dy = FIELD_STRIDE * gy - pointer.y;
      for (let gx = 0; gx < gridWidth; gx++) {
        const dx = FIELD_STRIDE * gx - pointer.x;
        glow[gy * gridWidth + gx] = peak * Math.exp(-(dx * dx + dy * dy) * falloff);
      }
    }
    return true;
  }

  function composite(isLit: boolean): void {
    if (!image) return;
    const gain = config.intensity * (1 + 0.05 * Math.sin(0.6 * time)) * maxIndex;
    for (let y = 0; y < height; y++) {
      const top = (y >> 2) * gridWidth;
      const bottom = top + gridWidth;
      const fy = (y & 3) * 0.25;
      const vertical = ramp[y] * gain;
      const dither = BAYER[y & 7];
      const out = y * width;
      for (let x = 0; x < width; x++) {
        const a = top + (x >> 2);
        const b = bottom + (x >> 2);
        const fx = (x & 3) * 0.25;
        const upper = field[a] + (field[a + 1] - field[a]) * fx;
        const lower = field[b] + (field[b + 1] - field[b]) * fx;
        let value = (upper + (lower - upper) * fy) * vertical + dither[x & 7];
        if (isLit) {
          const gu = glow[a] + (glow[a + 1] - glow[a]) * fx;
          const gl = glow[b] + (glow[b + 1] - glow[b]) * fx;
          value += gu + (gl - gu) * fy;
        }
        pixels[out + x] = palette[Math.min(value | 0, maxIndex)];
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  function draw(): void {
    computeField();
    composite(computeGlow());
  }

  function frame(now: number): void {
    frameId = requestAnimationFrame(frame);
    if (!isVisible) {
      lastFrame = 0;
      return;
    }
    if (lastFrame && now - lastFrame < 1000 / config.fps) return;
    if (lastFrame) time += Math.min(MAX_TIME_STEP, (now - lastFrame) / 1000) * config.speed;
    lastFrame = now;
    draw();
  }

  function start(): void {
    if (frameId || motionQuery?.matches || !config.playing) return;
    lastFrame = 0;
    frameId = requestAnimationFrame(frame);
  }

  function stop(): void {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  const handleMove = (event: PointerEvent): void => {
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    pointer.isOver = true;
  };
  const handleLeave = (): void => {
    pointer.isOver = false;
  };
  const handleVisibility = (): void => {
    isVisible = !document.hidden;
  };
  const handleMotionChange = (): void => {
    if (motionQuery?.matches) stop();
    else start();
  };

  const observer = new ResizeObserver(() => {
    resize();
    draw();
  });

  resize();
  draw();
  observer.observe(canvas);
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pointermove', handleMove, { passive: true });
  window.addEventListener('pointerleave', handleLeave, { passive: true });
  motionQuery?.addEventListener('change', handleMotionChange);
  start();

  return {
    update(next: FieldOptions): void {
      config = resolveConfig(config, next);
      palette = config.palette ?? resolvePalette(config.theme, config.tint);
      maxIndex = palette.length - 1;
      offsetX = 41.3 * config.seed;
      offsetY = 67.9 * config.seed;
      ramp = buildRamp();
      if (config.playing) start();
      else stop();
      draw();
    },
    destroy(): void {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerleave', handleLeave);
      motionQuery?.removeEventListener('change', handleMotionChange);
    },
  };
}
