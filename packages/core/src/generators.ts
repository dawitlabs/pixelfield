import { clamp01, type NoiseMode, sample, shapeNoise, smooth } from './noise.js';

export type FieldGenerator = 'noise' | 'cells' | 'rings' | 'waves' | 'grid' | 'spiral';

export interface GeneratorInput {
  field: Float32Array;
  gridWidth: number;
  gridHeight: number;
  stepX: number;
  stepY: number;
  driftX: number;
  driftY: number;
  time: number;
  scale: number;
  warp: number;
  contrast: number;
  mode: NoiseMode;
  tables: { warp: Float32Array; shape: Float32Array };
}

const STRIDE = 4;
const WARP_PRIMARY = 95;
const WARP_SECONDARY = 80;

function cellHash(x: number, y: number, salt: number): number {
  let h = (Math.imul(x, 0x27d4eb2f) ^ Math.imul(y, 0x165667b1) ^ Math.imul(salt, 0x9e3779b1)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  return ((h ^ (h >>> 13)) >>> 0) / 0x100000000;
}

function noiseField(input: GeneratorInput): void {
  const { field, gridWidth, gridHeight, stepX, stepY, driftX, driftY, time, tables } = input;
  const primary = WARP_PRIMARY * input.warp;
  const secondary = WARP_SECONDARY * input.warp;
  const window = 0.5 / input.contrast;

  for (let gy = 0; gy < gridHeight; gy++) {
    const ny = STRIDE * gy * stepY + driftY;
    for (let gx = 0; gx < gridWidth; gx++) {
      const nx = STRIDE * gx * stepX + driftX;
      const warped = sample(tables.warp, 0.7 * nx + 1.1 * time, 0.7 * ny + 1.6 * time);
      const drift = (warped - 0.5) * primary;
      const mid = sample(tables.shape, 0.85 * nx + drift + 0.7 * time, 0.85 * ny + drift);
      const spread = (mid - 0.5) * secondary;
      const raw = sample(tables.shape, nx + spread, ny + spread + 2.4 * time);
      const dense = shapeNoise(raw, input.mode);
      const ridge = 1 - Math.abs(2 * mid - 1);
      const shaped = smooth(clamp01((dense - 0.2) / window));
      field[gy * gridWidth + gx] = (0.3 + 0.85 * shaped) * (0.5 + 0.6 * (1 - ridge * ridge));
    }
  }
}

function cellsField(input: GeneratorInput): void {
  const { field, gridWidth, gridHeight, stepX, stepY, driftX, driftY, time } = input;
  const density = 0.06 * input.contrast;

  for (let gy = 0; gy < gridHeight; gy++) {
    const py = (STRIDE * gy * stepY + driftY) * density;
    for (let gx = 0; gx < gridWidth; gx++) {
      const px = (STRIDE * gx * stepX + driftX) * density;
      const cx = Math.floor(px);
      const cy = Math.floor(py);
      let nearest = 8;
      let second = 8;

      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const sx = cx + ox;
          const sy = cy + oy;
          const jitterX = cellHash(sx, sy, 1);
          const jitterY = cellHash(sx, sy, 2);
          const phase = cellHash(sx, sy, 3) * 6.283;
          const wobble = 0.3 * input.warp;
          const fx = sx + jitterX + wobble * Math.sin(time + phase);
          const fy = sy + jitterY + wobble * Math.cos(time * 0.8 + phase);
          const dx = fx - px;
          const dy = fy - py;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearest) {
            second = nearest;
            nearest = d;
          } else if (d < second) {
            second = d;
          }
        }
      }

      const edge = clamp01((second - nearest) * 1.6);
      const body = input.mode === 'ridged' ? 1 - edge : input.mode === 'billow' ? clamp01(nearest) : edge;
      field[gy * gridWidth + gx] = 0.2 + 0.95 * smooth(clamp01(body * input.contrast));
    }
  }
}

function ringsField(input: GeneratorInput): void {
  const { field, gridWidth, gridHeight, time, tables } = input;
  const ratio = gridWidth / Math.max(1, gridHeight);
  const frequency = 26 * input.scale;

  for (let gy = 0; gy < gridHeight; gy++) {
    const v = gy / gridHeight - 0.5;
    for (let gx = 0; gx < gridWidth; gx++) {
      const u = (gx / gridWidth - 0.5) * ratio;
      let d = Math.sqrt(u * u + v * v);
      if (input.warp > 0) {
        d += (sample(tables.shape, gx * 1.5 + time * 5, gy * 1.5) - 0.5) * 0.09 * input.warp;
      }
      const wave = 0.5 + 0.5 * Math.sin(d * frequency - time * 2.6);
      const sharpened = clamp01((shapeNoise(wave, input.mode) - 0.5) * input.contrast + 0.5);
      field[gy * gridWidth + gx] = 0.2 + smooth(sharpened);
    }
  }
}

function wavesField(input: GeneratorInput): void {
  const { field, gridWidth, gridHeight, time, tables } = input;
  const ratio = gridWidth / Math.max(1, gridHeight);
  const frequency = 22 * input.scale;

  for (let gy = 0; gy < gridHeight; gy++) {
    const v = gy / gridHeight;
    for (let gx = 0; gx < gridWidth; gx++) {
      const u = (gx / gridWidth) * ratio;
      let phase = 0;
      if (input.warp > 0) {
        phase = (sample(tables.warp, gx * 1.2 + time * 4, gy * 1.2) - 0.5) * 3.2 * input.warp;
      }
      const a = Math.sin(u * frequency + time * 1.7 + phase);
      const b = Math.sin(v * frequency * 0.8 - time * 1.1 + phase);
      const c = Math.sin((u + v) * frequency * 0.55 + time * 0.8);
      const combined = 0.5 + (a + b + c) / 6;
      const sharpened = clamp01((shapeNoise(clamp01(combined), input.mode) - 0.5) * input.contrast + 0.5);
      field[gy * gridWidth + gx] = 0.2 + smooth(sharpened);
    }
  }
}

function gridField(input: GeneratorInput): void {
  const { field, gridWidth, gridHeight, driftX, driftY, time, tables } = input;
  const ratio = gridWidth / Math.max(1, gridHeight);
  const cellsAcross = Math.max(2, 9 * input.scale);

  for (let gy = 0; gy < gridHeight; gy++) {
    const v = gy / gridHeight;
    for (let gx = 0; gx < gridWidth; gx++) {
      const u = (gx / gridWidth) * ratio;
      let ou = u * cellsAcross + driftX * 0.015;
      let ov = v * cellsAcross + driftY * 0.015;
      if (input.warp > 0) {
        ou += (sample(tables.warp, gx * 1.4 + time * 4, gy * 1.4) - 0.5) * 1.8 * input.warp;
        ov += (sample(tables.shape, gx * 1.4, gy * 1.4 + time * 4) - 0.5) * 1.8 * input.warp;
      }
      const su = Math.abs(((ou % 1) + 1) % 1 - 0.5) * 2;
      const sv = Math.abs(((ov % 1) + 1) % 1 - 0.5) * 2;
      const pattern =
        input.mode === 'billow' ? Math.max(su, sv) : input.mode === 'ridged' ? Math.abs(su - sv) : Math.min(su, sv);
      field[gy * gridWidth + gx] = 0.2 + smooth(clamp01((pattern - 0.5) * input.contrast + 0.5));
    }
  }
}

function spiralField(input: GeneratorInput): void {
  const { field, gridWidth, gridHeight, time, tables } = input;
  const ratio = gridWidth / Math.max(1, gridHeight);
  const arms = Math.max(1, Math.round(2 * input.contrast));
  const twist = 11 * input.scale;

  for (let gy = 0; gy < gridHeight; gy++) {
    const v = gy / gridHeight - 0.5;
    for (let gx = 0; gx < gridWidth; gx++) {
      const u = (gx / gridWidth - 0.5) * ratio;
      let angle = Math.atan2(v, u);
      const radius = Math.sqrt(u * u + v * v) * 2;
      if (input.warp > 0) {
        angle += (sample(tables.warp, gx * 1.6 + time * 3, gy * 1.6) - 0.5) * 2 * input.warp;
      }
      const wave = 0.5 + 0.5 * Math.sin(angle * arms + radius * twist - time * 2);
      const vignette = clamp01(1.35 - radius);
      field[gy * gridWidth + gx] = 0.2 + smooth(shapeNoise(wave, input.mode)) * vignette;
    }
  }
}

const GENERATORS: Record<FieldGenerator, (input: GeneratorInput) => void> = {
  noise: noiseField,
  cells: cellsField,
  rings: ringsField,
  waves: wavesField,
  grid: gridField,
  spiral: spiralField,
};

export const GENERATOR_NAMES = Object.keys(GENERATORS) as FieldGenerator[];

export function runGenerator(name: FieldGenerator, input: GeneratorInput): void {
  GENERATORS[name](input);
}
