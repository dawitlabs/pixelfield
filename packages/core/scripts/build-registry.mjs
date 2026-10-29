import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRESET_NAMES, PRESETS } from '../dist/presets.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'registry');

const DESCRIPTIONS = {
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

const pascal = (name) => name[0].toUpperCase() + name.slice(1);

const optionLines = (preset) =>
  Object.entries(preset)
    .map(([key, value]) =>
      key === 'flow'
        ? `      flow: { x: ${value.x}, y: ${value.y} },`
        : `      ${key}: ${typeof value === 'string' ? `'${value}'` : value},`,
    )
    .join('\n');

const reactSource = (name, preset) => `'use client';

import { createField } from '@dawitlabs/pixelfield';
import { useEffect, useRef } from 'react';

export interface ${pascal(name)}Props {
  className?: string;
  tint?: string;
  seed?: number;
  interactive?: boolean;
}

export function ${pascal(name)}({ className, tint, seed = 0, interactive = true }: ${pascal(name)}Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const field = createField(canvas, {
${optionLines(preset)}
      seed,
      tint,
      interactive,
    });
    return () => field.destroy();
  }, [tint, seed, interactive]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
`;

const svelteSource = (_name, preset) => `<script lang="ts">
  import { createField, type FieldHandle } from '@dawitlabs/pixelfield';

  interface Props {
    class?: string;
    tint?: string;
    seed?: number;
    interactive?: boolean;
  }

  let { class: className = '', tint = undefined, seed = 0, interactive = true }: Props = $props();

  let canvas: HTMLCanvasElement;

  $effect(() => {
    const field: FieldHandle = createField(canvas, {
${optionLines(preset)}
      seed,
      tint,
      interactive,
    });
    return () => field.destroy();
  });
</script>

<canvas bind:this={canvas} class={className} aria-hidden="true"></canvas>

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
`;

const vanillaSource = (name, preset) => `import { createField } from '@dawitlabs/pixelfield';

export function mount${pascal(name)}(canvas, { tint, seed = 0, interactive = true } = {}) {
  return createField(canvas, {
${optionLines(preset)}
    seed,
    tint,
    interactive,
  });
}
`;

mkdirSync(outDir, { recursive: true });

const index = [];

for (const name of PRESET_NAMES) {
  const preset = PRESETS[name];
  const item = {
    $schema: 'https://pixelfield.dev/schema/registry-item.json',
    name,
    type: 'registry:effect',
    generator: preset.generator,
    description: DESCRIPTIONS[name] ?? '',
    dependencies: ['@dawitlabs/pixelfield'],
    options: preset,
    files: [
      { target: `pixelfield/${name}.tsx`, framework: 'react', content: reactSource(name, preset) },
      {
        target: `pixelfield/${pascal(name)}.svelte`,
        framework: 'svelte',
        content: svelteSource(name, preset),
      },
      { target: `pixelfield/${name}.js`, framework: 'vanilla', content: vanillaSource(name, preset) },
    ],
  };
  writeFileSync(join(outDir, `${name}.json`), `${JSON.stringify(item, null, 2)}\n`);
  index.push({ name, type: item.type, generator: item.generator, description: item.description });
}

writeFileSync(
  join(outDir, 'index.json'),
  `${JSON.stringify({ version: 1, count: index.length, items: index }, null, 2)}\n`,
);

console.log(`registry: ${index.length} effects written to registry/`);
