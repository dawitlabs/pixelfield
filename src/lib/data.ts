import { type FieldGenerator, type FieldPreset, PRESET_NAMES, PRESETS } from '@dawitlabs/pixelfield';

export type { FieldPreset };

export const GENERATOR_META: Record<FieldGenerator, { label: string; blurb: string }> = {
  noise: { label: 'Noise', blurb: 'Domain-warped value noise. Soft, organic, endless.' },
  cells: { label: 'Cells', blurb: 'Voronoi distance fields. Edges, bodies, cracks.' },
  rings: { label: 'Rings', blurb: 'Concentric waves radiating from the centre.' },
  waves: { label: 'Waves', blurb: 'Crossed sine waves and the interference between them.' },
  grid: { label: 'Grid', blurb: 'Repeating lattices, warped or clean.' },
  spiral: { label: 'Spiral', blurb: 'Angular sweeps twisting out from a core.' },
};

export const EFFECT_NOTES: Record<string, string> = {
  clouds: 'Soft fbm billows gathering at the top edge.',
  fog: 'Low frequency haze that barely moves.',
  streaks: 'Squashed billow noise pushed sideways. Interference, not water.',
  terrain: 'Ridged noise at high contrast. Sharp veins.',
  plasma: 'Warp and time at 2.4. The domain eats itself.',
  smoke: 'Stretched vertically, drifting up into the ceiling.',
  nebula: 'Ridged at low frequency. Structure without edges.',
  static: 'No warp, frequency past the pixel grid.',
  aurora: 'Ridged bands squashed flat and drifting sideways.',
  marble: 'Heavy warp on ridged noise, almost still.',
  cells: 'Voronoi edges wobbling against each other.',
  cracks: 'Inverted cell edges at high contrast.',
  bubbles: 'Cell bodies rising and fading out of the top.',
  mosaic: 'Flat voronoi tiles, nearly frozen.',
  ripple: 'Concentric rings expanding from the centre.',
  sonar: 'Hard ringed sweep at low frequency.',
  droplet: 'Tight folded rings with a warped centre.',
  moire: 'Three sine waves crossing at high frequency.',
  silk: 'Soft low frequency interference.',
  current: 'Folded waves with heavy warp.',
  checker: 'Clean checkerboard drifting sideways.',
  weave: 'Interlocked grid lines from a ridged fold.',
  circuit: 'Warped grid broken into traces.',
  vortex: 'Two spiral arms turning from the centre.',
  galaxy: 'Ridged spiral arms with a soft core.',
  portal: 'Fast folded spiral with a hard rim.',
};

export const EFFECTS = PRESET_NAMES.map((name) => ({
  name,
  generator: PRESETS[name].generator as FieldGenerator,
  note: EFFECT_NOTES[name] ?? '',
  options: PRESETS[name],
}));

export const FAMILIES = (Object.keys(GENERATOR_META) as FieldGenerator[]).map((generator) => ({
  generator,
  ...GENERATOR_META[generator],
  count: EFFECTS.filter((e) => e.generator === generator).length,
}));

export const TINTS = [
  { name: 'white', hex: '#ffffff' },
  { name: 'bone', hex: '#e8e4dc' },
  { name: 'steel', hex: '#9aa0a6' },
  { name: 'native', hex: '' },
] as const;

export const EFFECT_TINT: Record<string, string> = Object.fromEntries(
  PRESET_NAMES.map((name) => [name, '#ffffff']),
);

export const FEATURED = ['plasma', 'galaxy', 'ripple', 'circuit'] as const;

export function pascal(name: string): string {
  return name[0].toUpperCase() + name.slice(1);
}

export function optionLines(options: Record<string, unknown>, indent = '      '): string {
  return Object.entries(options)
    .map(([key, value]) =>
      key === 'flow'
        ? `${indent}flow: { x: ${(value as { x: number }).x}, y: ${(value as { y: number }).y} },`
        : `${indent}${key}: ${typeof value === 'string' ? `'${value}'` : value},`,
    )
    .join('\n');
}

export function sourceFor(
  framework: 'react' | 'svelte' | 'vanilla',
  name: string,
  options: Record<string, unknown>,
): string {
  if (framework === 'svelte') {
    return `<script lang="ts">
  import { createField } from '@dawitlabs/pixelfield';

  let { class: className = '', tint = undefined }: { class?: string; tint?: string } = $props();
  let canvas: HTMLCanvasElement;

  $effect(() => {
    const field = createField(canvas, {
${optionLines(options)}
      tint,
    });
    return () => field.destroy();
  });
</script>

<canvas bind:this={canvas} class={className} aria-hidden="true"></canvas>`;
  }
  if (framework === 'react') {
    return `'use client';

import { createField } from '@dawitlabs/pixelfield';
import { useEffect, useRef } from 'react';

export function ${pascal(name)}({ className, tint }: { className?: string; tint?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const field = createField(ref.current, {
${optionLines(options)}
      tint,
    });
    return () => field.destroy();
  }, [tint]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}`;
  }
  return `import { createField } from '@dawitlabs/pixelfield';

const field = createField(document.querySelector('canvas'), {
${optionLines(options, '  ')}
});`;
}

export const OPTIONS = [
  {
    name: 'preset',
    type: 'FieldPreset',
    fallback: "'clouds'",
    note: 'Applies a bundle of the options below. Anything passed alongside it wins.',
  },
  {
    name: 'generator',
    type: "'noise' | 'cells' | 'rings' | 'waves' | 'grid' | 'spiral'",
    fallback: "'noise'",
    note: 'Which scalar field feeds the dither.',
  },
  { name: 'falloff', type: "'up' | 'down' | 'fill'", fallback: "'down'", note: 'Vertical density ramp.' },
  {
    name: 'mode',
    type: "'fbm' | 'ridged' | 'billow'",
    fallback: "'fbm'",
    note: 'Shapes the sample. Ridged inverts the midpoint, billow folds it.',
  },
  { name: 'scale', type: 'number', fallback: '1', note: 'Frequency multiplier.' },
  {
    name: 'aspect',
    type: 'number',
    fallback: '1',
    note: 'Anisotropy. Below 1 squashes horizontally, above 1 stretches vertically.',
  },
  {
    name: 'warp',
    type: 'number',
    fallback: '1',
    note: 'Domain warp strength. 0 is clean, 2.5 is turbulence.',
  },
  { name: 'contrast', type: 'number', fallback: '1', note: 'Narrows the tonal window toward hard edges.' },
  { name: 'speed', type: 'number', fallback: '1', note: 'Time multiplier.' },
  {
    name: 'flow',
    type: '{ x: number; y: number }',
    fallback: '{ x: 0, y: 0 }',
    note: 'Constant drift applied to the sampling origin.',
  },
  { name: 'seed', type: 'number', fallback: '0', note: 'Offsets the field and its start time.' },
  {
    name: 'intensity',
    type: 'number',
    fallback: '1',
    note: 'Multiplies the palette index before dithering.',
  },
  {
    name: 'theme',
    type: "'light' | 'dark'",
    fallback: "'dark'",
    note: 'Picks the built in palette. Ignored when tint or palette is set.',
  },
  { name: 'tint', type: 'string', fallback: '—', note: 'Hex colour. Derives a seven step ramp around it.' },
  {
    name: 'palette',
    type: 'Uint32Array',
    fallback: '—',
    note: 'Your own packed ramp. Index 0 must be fully transparent.',
  },
  { name: 'interactive', type: 'boolean', fallback: 'true', note: 'Pointer bump near the cursor.' },
  { name: 'playing', type: 'boolean', fallback: 'true', note: 'Stops the loop. The last frame stays.' },
  { name: 'fps', type: 'number', fallback: '24', note: 'Render cap.' },
] as const;

export const PRESET_NOTES = EFFECT_NOTES;
