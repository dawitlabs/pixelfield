export type Rgba = readonly [number, number, number, number];
export type FieldTheme = 'light' | 'dark';

export const BAYER: readonly Float32Array[] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => Float32Array.from(row, (v) => (v + 0.5) / 64));

export function packPalette(colors: readonly Rgba[]): Uint32Array {
  return Uint32Array.from(colors, ([r, g, b, a]) => (r | (g << 8) | (b << 16) | (a << 24)) >>> 0);
}

export const DARK_PALETTE: Uint32Array = packPalette([
  [0, 0, 0, 0],
  [7, 16, 48, 255],
  [12, 36, 104, 255],
  [18, 66, 172, 255],
  [32, 114, 228, 255],
  [104, 184, 255, 255],
  [222, 243, 255, 255],
]);

export const LIGHT_PALETTE: Uint32Array = packPalette([
  [0, 0, 0, 0],
  [228, 236, 250, 255],
  [196, 214, 246, 255],
  [150, 184, 240, 255],
  [96, 142, 226, 255],
  [46, 96, 196, 255],
  [16, 52, 140, 255],
]);

const WHITE: Rgba = [255, 255, 255, 255];
const BLACK: Rgba = [0, 0, 0, 255];

function mix(from: Rgba, to: Rgba, t: number): Rgba {
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
    255,
  ];
}

function parseHex(hex: string): Rgba {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  if (!Number.isFinite(value)) {
    throw new Error(`pixel-clouds: tint must be a hex colour, received "${hex}"`);
  }
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
}

export function paletteFromTint(hex: string, theme: FieldTheme): Uint32Array {
  const base = parseHex(hex);
  const steps: Rgba[] =
    theme === 'light'
      ? [
          [0, 0, 0, 0],
          mix(base, WHITE, 0.9),
          mix(base, WHITE, 0.78),
          mix(base, WHITE, 0.6),
          mix(base, WHITE, 0.35),
          mix(base, WHITE, 0),
          mix(base, BLACK, 0.3),
        ]
      : [
          [0, 0, 0, 0],
          mix(base, BLACK, 0.86),
          mix(base, BLACK, 0.7),
          mix(base, BLACK, 0.45),
          mix(base, BLACK, 0),
          mix(base, WHITE, 0.22),
          mix(base, WHITE, 0.5),
        ];
  return packPalette(steps);
}

export function resolvePalette(theme: FieldTheme, tint?: string): Uint32Array {
  if (tint) return paletteFromTint(tint, theme);
  return theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;
}
