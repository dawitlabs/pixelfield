const TABLE = 256;
const OCTAVES = 5;
const GAIN = 0.55;
const BASE_LATTICE = 4;

export type NoiseMode = 'fbm' | 'ridged' | 'billow';

export const smooth = (t: number): number => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

function hash(a: number, b: number): number {
  let h = (Math.imul(a, 0x165667b1) + Math.imul(b, 0x27d4eb2f)) | 0;
  h = Math.imul(h ^ (h >>> 13), 0x4bf19f61);
  return ((h ^ (h >>> 16)) >>> 0) / 0x100000000;
}

export function buildNoiseTable(seed: number): Float32Array {
  const table = new Float32Array(TABLE * TABLE);
  let amplitude = 1;
  let lattice = BASE_LATTICE;
  let total = 0;

  for (let octave = 0; octave < OCTAVES; octave++) {
    const grid = new Float32Array(lattice * lattice);
    for (let i = 0; i < grid.length; i++) {
      grid[i] = hash(i + 1, 131 * seed + 17 * octave);
    }
    for (let y = 0; y < TABLE; y++) {
      const fy = (y / TABLE) * lattice;
      const y0 = fy | 0;
      const y1 = (y0 + 1) % lattice;
      const ty = smooth(fy - y0);
      for (let x = 0; x < TABLE; x++) {
        const fx = (x / TABLE) * lattice;
        const x0 = fx | 0;
        const x1 = (x0 + 1) % lattice;
        const tx = smooth(fx - x0);
        const top = lerp(grid[y0 * lattice + x0], grid[y0 * lattice + x1], tx);
        const bottom = lerp(grid[y1 * lattice + x0], grid[y1 * lattice + x1], tx);
        table[TABLE * y + x] += lerp(top, bottom, ty) * amplitude;
      }
    }
    total += amplitude;
    amplitude *= GAIN;
    lattice *= 2;
  }

  for (let i = 0; i < table.length; i++) table[i] /= total;
  return table;
}

export function sample(table: Float32Array, x: number, y: number): number {
  const wx = ((x % TABLE) + TABLE) % TABLE;
  const wy = ((y % TABLE) + TABLE) % TABLE;
  const x0 = wx | 0;
  const y0 = wy | 0;
  const x1 = (x0 + 1) & 255;
  const y1 = (y0 + 1) & 255;
  const tx = wx - x0;
  const top = lerp(table[TABLE * y0 + x0], table[TABLE * y0 + x1], tx);
  const bottom = lerp(table[TABLE * y1 + x0], table[TABLE * y1 + x1], tx);
  return lerp(top, bottom, wy - y0);
}

export function shapeNoise(value: number, mode: NoiseMode): number {
  if (mode === 'ridged') return 1 - Math.abs(2 * value - 1);
  if (mode === 'billow') return Math.abs(2 * value - 1);
  return value;
}
