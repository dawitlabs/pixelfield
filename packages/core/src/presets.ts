import type { FieldGenerator } from './generators.js';
import type { NoiseMode } from './noise.js';

export type FieldFalloff = 'up' | 'down' | 'fill';

export interface PresetShape {
  generator: FieldGenerator;
  falloff: FieldFalloff;
  scale: number;
  aspect: number;
  warp: number;
  contrast: number;
  mode: NoiseMode;
  speed: number;
  intensity: number;
  flow: { x: number; y: number };
}

const NONE = { x: 0, y: 0 };

export const PRESETS = {
  clouds: { generator: 'noise', falloff: 'down', scale: 1, aspect: 1, warp: 1, contrast: 1, mode: 'fbm', speed: 1, intensity: 1, flow: NONE },
  fog: { generator: 'noise', falloff: 'fill', scale: 0.55, aspect: 0.5, warp: 0.5, contrast: 0.6, mode: 'fbm', speed: 0.45, intensity: 0.85, flow: { x: 6, y: 0 } },
  streaks: { generator: 'noise', falloff: 'fill', scale: 1.5, aspect: 0.3, warp: 0.75, contrast: 1.25, mode: 'billow', speed: 1.2, intensity: 1, flow: { x: 18, y: 0 } },
  terrain: { generator: 'noise', falloff: 'fill', scale: 1.1, aspect: 1, warp: 0.35, contrast: 2.4, mode: 'ridged', speed: 0.2, intensity: 1, flow: NONE },
  plasma: { generator: 'noise', falloff: 'fill', scale: 0.9, aspect: 1, warp: 2.4, contrast: 1.3, mode: 'fbm', speed: 2.4, intensity: 1.1, flow: NONE },
  smoke: { generator: 'noise', falloff: 'up', scale: 1.15, aspect: 1.5, warp: 1.7, contrast: 0.95, mode: 'fbm', speed: 1.1, intensity: 1, flow: { x: 0, y: -20 } },
  nebula: { generator: 'noise', falloff: 'fill', scale: 0.62, aspect: 1, warp: 1.5, contrast: 2.1, mode: 'ridged', speed: 0.3, intensity: 1.2, flow: NONE },
  static: { generator: 'noise', falloff: 'fill', scale: 3.4, aspect: 1, warp: 0, contrast: 3.2, mode: 'fbm', speed: 3.2, intensity: 1, flow: NONE },
  aurora: { generator: 'noise', falloff: 'up', scale: 0.8, aspect: 0.35, warp: 1.9, contrast: 1.8, mode: 'ridged', speed: 0.7, intensity: 1.1, flow: { x: 9, y: 0 } },
  marble: { generator: 'noise', falloff: 'fill', scale: 1.3, aspect: 1, warp: 2.6, contrast: 3, mode: 'ridged', speed: 0.15, intensity: 1, flow: NONE },

  cells: { generator: 'cells', falloff: 'fill', scale: 1, aspect: 1, warp: 0.6, contrast: 1, mode: 'fbm', speed: 0.6, intensity: 1, flow: NONE },
  cracks: { generator: 'cells', falloff: 'fill', scale: 1, aspect: 1, warp: 0.2, contrast: 2.2, mode: 'ridged', speed: 0.2, intensity: 1, flow: NONE },
  bubbles: { generator: 'cells', falloff: 'up', scale: 1, aspect: 1, warp: 1.1, contrast: 0.8, mode: 'billow', speed: 1.1, intensity: 1, flow: { x: 0, y: -6 } },
  mosaic: { generator: 'cells', falloff: 'fill', scale: 1, aspect: 1, warp: 0, contrast: 1.6, mode: 'billow', speed: 0.08, intensity: 1, flow: NONE },

  ripple: { generator: 'rings', falloff: 'fill', scale: 1, aspect: 1, warp: 0, contrast: 1, mode: 'fbm', speed: 1, intensity: 1, flow: NONE },
  sonar: { generator: 'rings', falloff: 'fill', scale: 0.7, aspect: 1, warp: 0, contrast: 2.4, mode: 'ridged', speed: 0.6, intensity: 1, flow: NONE },
  droplet: { generator: 'rings', falloff: 'fill', scale: 1.6, aspect: 1, warp: 0.9, contrast: 1.5, mode: 'billow', speed: 1.5, intensity: 1, flow: NONE },

  moire: { generator: 'waves', falloff: 'fill', scale: 2.4, aspect: 1, warp: 0, contrast: 2.8, mode: 'fbm', speed: 0.5, intensity: 1, flow: NONE },
  silk: { generator: 'waves', falloff: 'fill', scale: 0.85, aspect: 1, warp: 0.45, contrast: 0.85, mode: 'fbm', speed: 0.8, intensity: 1, flow: NONE },
  current: { generator: 'waves', falloff: 'fill', scale: 1.5, aspect: 1, warp: 1.1, contrast: 1.5, mode: 'billow', speed: 1.4, intensity: 1, flow: NONE },

  checker: { generator: 'grid', falloff: 'fill', scale: 1, aspect: 1, warp: 0, contrast: 2.6, mode: 'fbm', speed: 0.3, intensity: 1, flow: { x: 4, y: 0 } },
  weave: { generator: 'grid', falloff: 'fill', scale: 1.6, aspect: 1, warp: 0.3, contrast: 1.4, mode: 'ridged', speed: 0.5, intensity: 1, flow: NONE },
  circuit: { generator: 'grid', falloff: 'fill', scale: 0.7, aspect: 1, warp: 1.2, contrast: 2.8, mode: 'billow', speed: 0.4, intensity: 1, flow: NONE },

  vortex: { generator: 'spiral', falloff: 'fill', scale: 1, aspect: 1, warp: 0.4, contrast: 1, mode: 'fbm', speed: 1, intensity: 1, flow: NONE },
  galaxy: { generator: 'spiral', falloff: 'fill', scale: 1, aspect: 1, warp: 1.1, contrast: 1.6, mode: 'ridged', speed: 0.35, intensity: 1.1, flow: NONE },
  portal: { generator: 'spiral', falloff: 'fill', scale: 1, aspect: 1, warp: 0.2, contrast: 2.6, mode: 'billow', speed: 1.8, intensity: 1, flow: NONE },
} as const satisfies Record<string, PresetShape>;

export type FieldPreset = keyof typeof PRESETS;

export const PRESET_NAMES = Object.keys(PRESETS) as FieldPreset[];

export const PRESETS_BY_GENERATOR = PRESET_NAMES.reduce<Record<string, FieldPreset[]>>((acc, name) => {
  const key = PRESETS[name].generator;
  (acc[key] ??= []).push(name);
  return acc;
}, {});
