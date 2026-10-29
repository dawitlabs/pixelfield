<script lang="ts">
  import {
    GENERATOR_NAMES,
    PRESETS,
    PRESET_NAMES,
    type FieldFalloff,
    type FieldGenerator,
    type FieldPreset,
    type NoiseMode,
  } from '@dawitlabs/pixelfield';
  import Field from '@dawitlabs/pixelfield/svelte';
  import { onMount } from 'svelte';
  import Choice from '$lib/components/Choice.svelte';
  import Code from '$lib/components/Code.svelte';
  import Control from '$lib/components/Control.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { optionLines, pascal } from '$lib/data';
  import { fieldTheme, fieldTint, mode } from '$lib/mode.svelte';

  const FALLOFFS: FieldFalloff[] = ['up', 'down', 'fill'];
  const MODES: NoiseMode[] = ['fbm', 'ridged', 'billow'];
  const FRAMEWORKS = ['svelte', 'react', 'vanilla'] as const;

  type Config = {
    generator: FieldGenerator;
    falloff: FieldFalloff;
    mode: NoiseMode;
    scale: number;
    aspect: number;
    warp: number;
    contrast: number;
    speed: number;
    intensity: number;
    seed: number;
    fps: number;
    flowX: number;
    flowY: number;
  };

  const BASE: Config = {
    generator: 'noise',
    falloff: 'down',
    mode: 'fbm',
    scale: 1,
    aspect: 1,
    warp: 1,
    contrast: 1,
    speed: 1,
    intensity: 1,
    seed: 0,
    fps: 24,
    flowX: 0,
    flowY: 0,
  };

  let config = $state<Config>({ ...BASE });
  let framework = $state<(typeof FRAMEWORKS)[number]>('svelte');
  let stage = $state<HTMLElement | null>(null);
  let note = $state('');

  const options = $derived({
    generator: config.generator,
    falloff: config.falloff,
    mode: config.mode,
    scale: round(config.scale),
    aspect: round(config.aspect),
    warp: round(config.warp),
    contrast: round(config.contrast),
    speed: round(config.speed),
    intensity: round(config.intensity),
    seed: config.seed,
    fps: config.fps,
    flow: { x: round(config.flowX), y: round(config.flowY) },
  });

  const source = $derived(buildSource(framework, options));
  const json = $derived(JSON.stringify(options, null, 2));

  function round(n: number): number {
    return Math.round(n * 100) / 100;
  }

  function buildSource(kind: (typeof FRAMEWORKS)[number], opts: Record<string, unknown>): string {
    if (kind === 'svelte') {
      return `<script lang="ts">
  import { createField } from '@dawitlabs/pixelfield';

  let canvas: HTMLCanvasElement;

  $effect(() => {
    const field = createField(canvas, {
${optionLines(opts)}
    });
    return () => field.destroy();
  });
<\/script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>`;
    }
    if (kind === 'react') {
      return `'use client';

import { createField } from '@dawitlabs/pixelfield';
import { useEffect, useRef } from 'react';

export function ${pascal(opts.generator as string)}Field({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const field = createField(ref.current, {
${optionLines(opts)}
    });
    return () => field.destroy();
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}`;
    }
    return `import { createField } from '@dawitlabs/pixelfield';

const field = createField(document.querySelector('canvas'), {
${optionLines(opts, '  ')}
});`;
  }

  function loadPreset(name: FieldPreset): void {
    const p = PRESETS[name];
    config = {
      ...config,
      generator: p.generator,
      falloff: p.falloff,
      mode: p.mode,
      scale: p.scale,
      aspect: p.aspect,
      warp: p.warp,
      contrast: p.contrast,
      speed: p.speed,
      intensity: p.intensity,
      flowX: p.flow.x,
      flowY: p.flow.y,
    };
    flash(`loaded ${name}`);
  }

  function randomise(): void {
    const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
    const between = (a: number, b: number) => round(a + Math.random() * (b - a));
    config = {
      generator: pick(GENERATOR_NAMES),
      falloff: pick(FALLOFFS),
      mode: pick(MODES),
      scale: between(0.4, 2.6),
      aspect: between(0.25, 2),
      warp: between(0, 2.4),
      contrast: between(0.5, 3),
      speed: between(0.2, 2.4),
      intensity: between(0.7, 1.3),
      seed: Math.floor(Math.random() * 40),
      fps: 24,
      flowX: Math.random() < 0.6 ? 0 : between(-20, 20),
      flowY: Math.random() < 0.75 ? 0 : between(-20, 20),
    };
    flash('randomised');
  }

  function flash(message: string): void {
    note = message;
    setTimeout(() => (note = ''), 1800);
  }

  function share(): void {
    const encoded = btoa(JSON.stringify(config));
    const url = `${location.origin}${location.pathname}#${encoded}`;
    history.replaceState(null, '', `#${encoded}`);
    navigator.clipboard?.writeText(url).then(
      () => flash('link copied'),
      () => flash('copy blocked'),
    );
  }

  function downloadPng(): void {
    const canvas = stage?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `pixelfield-${config.generator}-${config.seed}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    flash('png saved');
  }

  function downloadJson(): void {
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `pixelfield-${config.generator}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    flash('json saved');
  }

  onMount(() => {
    if (!location.hash) return;
    try {
      const parsed = JSON.parse(atob(location.hash.slice(1))) as Partial<Config>;
      config = { ...BASE, ...parsed };
      flash('loaded from link');
    } catch {
      flash('bad link');
    }
  });
</script>

<svelte:head>
  <title>Creator — pixelfield</title>
  <meta name="description" content="Author a pixelfield effect and export it as a component, JSON or PNG." />
</svelte:head>

<main class="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_26rem]">
  <div bind:this={stage} class="relative min-h-[48svh] lg:sticky lg:top-0 lg:h-svh">
    <Field
      generator={config.generator}
      falloff={config.falloff}
      mode={config.mode}
      scale={config.scale}
      aspect={config.aspect}
      warp={config.warp}
      contrast={config.contrast}
      speed={config.speed}
      intensity={config.intensity}
      seed={config.seed}
      fps={config.fps}
      flow={{ x: config.flowX, y: config.flowY }}
      tint={fieldTint(mode.current)}
      theme={fieldTheme(mode.current)}
    />

    {#if note}
      <p
        class="absolute bottom-4 left-4 px-2 py-1 font-mono text-[10.5px] tracking-[0.16em] uppercase"
        style="background: var(--color-paper); color: var(--color-ink)"
      >
        {note}
      </p>
    {/if}
  </div>

  <aside class="flex flex-col gap-7 px-5 pt-20 pb-14" style="box-shadow: inset 1px 0 0 var(--color-hairline-soft)">
    <header>
      <p class="tag">creator</p>
      <h1 class="display mt-2.5 text-[2rem]">
        Make <span class="accent-serif italic">one</span>
      </h1>
    </header>

    <div class="flex gap-px" style="background: var(--color-hairline-soft)">
      <button type="button" data-blobity onclick={randomise} class="flex flex-1 items-center justify-center gap-1.5 bg-ink px-3 py-2.5 font-mono text-[11px] text-dim transition-colors hover:text-paper">
        <Icon name="dice" size={12} /> random
      </button>
      <button type="button" data-blobity onclick={() => (config = { ...BASE })} class="flex flex-1 items-center justify-center gap-1.5 bg-ink px-3 py-2.5 font-mono text-[11px] text-dim transition-colors hover:text-paper">
        <Icon name="reload" size={12} /> reset
      </button>
      <button type="button" data-blobity onclick={share} class="flex flex-1 items-center justify-center gap-1.5 bg-ink px-3 py-2.5 font-mono text-[11px] text-dim transition-colors hover:text-paper">
        <Icon name="link" size={12} /> share
      </button>
    </div>

    <div>
      <span class="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">start from</span>
      <div class="mt-2 flex flex-wrap gap-1">
        {#each PRESET_NAMES as name (name)}
          <button
            type="button"
            data-blobity
            onclick={() => loadPreset(name)}
            class="px-1.5 py-1 font-mono text-[10.5px] text-faint transition-colors duration-150 hover:text-paper"
          >
            {name}
          </button>
        {/each}
      </div>
    </div>

    <div class="dither-rule"></div>

    <Choice label="generator" value={config.generator} options={GENERATOR_NAMES} onpick={(v) => (config.generator = v as FieldGenerator)} />
    <Choice label="falloff" value={config.falloff} options={FALLOFFS} onpick={(v) => (config.falloff = v as FieldFalloff)} />
    <Choice label="mode" value={config.mode} options={MODES} onpick={(v) => (config.mode = v as NoiseMode)} />

    <div class="dither-rule"></div>

    <Control label="scale" value={config.scale} min={0.2} max={3.6} step={0.05} hint="Frequency. Past 2 structure drops below the pixel grid." oninput={(v) => (config.scale = v)} />
    <Control label="aspect" value={config.aspect} min={0.15} max={2.5} step={0.05} hint="Below 1 squashes horizontally, above 1 stretches vertically." oninput={(v) => (config.aspect = v)} />
    <Control label="warp" value={config.warp} min={0} max={2.8} step={0.05} hint="0 is clean, 2.5 is turbulence." oninput={(v) => (config.warp = v)} />
    <Control label="contrast" value={config.contrast} min={0.3} max={3.6} step={0.05} hint="Narrows the tonal window toward hard edges." oninput={(v) => (config.contrast = v)} />
    <Control label="speed" value={config.speed} min={0} max={3} step={0.05} oninput={(v) => (config.speed = v)} />
    <Control label="intensity" value={config.intensity} min={0.3} max={1.6} step={0.05} oninput={(v) => (config.intensity = v)} />
    <Control label="flow x" value={config.flowX} min={-30} max={30} step={1} oninput={(v) => (config.flowX = v)} />
    <Control label="flow y" value={config.flowY} min={-30} max={30} step={1} oninput={(v) => (config.flowY = v)} />
    <Control label="seed" value={config.seed} min={0} max={48} step={1} oninput={(v) => (config.seed = v)} />
    <Control label="fps" value={config.fps} min={6} max={60} step={1} oninput={(v) => (config.fps = v)} />

    <div class="dither-rule"></div>

    <div>
      <div class="flex items-center gap-4">
        {#each FRAMEWORKS as f (f)}
          <button
            type="button"
            data-blobity
            onclick={() => (framework = f)}
            data-active={framework === f}
            class="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase transition-colors duration-150 hover:text-paper data-[active=true]:text-paper"
          >
            {f}
          </button>
        {/each}
      </div>
      <div class="mt-3">
        <Code code={source} title="{framework} component" />
      </div>
    </div>

    <div class="flex gap-px" style="background: var(--color-hairline-soft)">
      <button type="button" data-blobity onclick={downloadPng} class="flex flex-1 items-center justify-center gap-1.5 bg-ink px-3 py-2.5 font-mono text-[11px] text-dim transition-colors hover:text-paper">
        <Icon name="image" size={12} /> png
      </button>
      <button type="button" data-blobity onclick={downloadJson} class="flex flex-1 items-center justify-center gap-1.5 bg-ink px-3 py-2.5 font-mono text-[11px] text-dim transition-colors hover:text-paper">
        <Icon name="download" size={12} /> json
      </button>
    </div>
  </aside>
</main>
