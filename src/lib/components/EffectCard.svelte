<script lang="ts">
  import Field from '@dawitlabs/pixelfield/svelte';
  import type { FieldPreset } from '@dawitlabs/pixelfield';
  import { EFFECT_TINT, GENERATOR_META } from '$lib/data';
  import type { FieldGenerator } from '@dawitlabs/pixelfield';

  interface Props {
    name: FieldPreset;
    generator: FieldGenerator;
    note: string;
    tint?: string;
    seed?: number;
    span?: boolean;
    index?: number;
    onopen?: (name: FieldPreset) => void;
  }

  let { name, generator, note, tint = undefined, seed = 3, span = false, index = 0, onopen }: Props = $props();

  const colour = $derived(tint || EFFECT_TINT[name]);
</script>

<button
  type="button"
  onclick={() => onopen?.(name)}
  style="--c: {colour}; animation-delay: {Math.min(index * 32, 520)}ms"
  class="rise group relative isolate flex h-full flex-col overflow-hidden rounded-md bg-obsidian text-left ring-1 ring-hairline transition-[transform,box-shadow,ring-color] duration-500 ease-[var(--ease-spring)] hover:-translate-y-1.5 hover:ring-[color:var(--c)] hover:shadow-[0_28px_60px_-24px_var(--c)] focus-visible:-translate-y-1.5 {span
    ? 'sm:col-span-2 sm:row-span-2'
    : ''}"
  aria-label="Open {name}"
>
  <span class="relative block min-h-0 flex-1">
    <Field preset={name} tint={colour} {seed} interactive={false} />
  </span>

  <span
    class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent px-3.5 pt-10 pb-3"
  >
    <span class="flex items-baseline justify-between gap-2">
      <span class="font-display text-[15px] font-600 tracking-tight text-ice">{name}</span>
      <span class="num text-[10px] tracking-[0.14em] text-muted uppercase">{generator}</span>
    </span>
    <span
      class="mt-1 block max-h-0 overflow-hidden text-[12.5px] leading-[1.5] text-muted opacity-0 transition-all duration-400 ease-[var(--ease-soft)] group-hover:max-h-16 group-hover:opacity-100 group-focus-visible:max-h-16 group-focus-visible:opacity-100"
    >
      {note}
    </span>
  </span>

  <span
    class="pointer-events-none absolute top-3 right-3 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    style="background: var(--c); box-shadow: 0 0 12px var(--c)"
  ></span>
</button>
