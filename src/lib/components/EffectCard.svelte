<script lang="ts">
  import Field from '@dawitlabs/pixelfield/svelte';
  import type { FieldGenerator, FieldPreset, FieldTheme } from '@dawitlabs/pixelfield';

  interface Props {
    name: FieldPreset;
    generator: FieldGenerator;
    note: string;
    tint?: string;
    fieldTheme?: FieldTheme;
    seed?: number;
    span?: boolean;
    index?: number;
    onopen?: (name: FieldPreset) => void;
  }

  let {
    name,
    generator,
    note,
    tint = '#ffffff',
    fieldTheme = 'dark',
    seed = 3,
    span = false,
    index = 0,
    onopen,
  }: Props = $props();
</script>

<button
  type="button"
  onclick={() => onopen?.(name)}
  style="animation-delay: {Math.min(index * 26, 420)}ms"
  class="rise group relative flex h-full flex-col bg-ink text-left {span
    ? 'sm:col-span-2 sm:row-span-2'
    : ''}"
  aria-label="Open {name}"
>
  <span class="relative block min-h-0 flex-1 overflow-hidden">
    <Field preset={name} {tint} theme={fieldTheme} {seed} interactive={false} />
    <span
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      style="box-shadow: inset 0 0 0 2px var(--color-paper)"
    ></span>
    <span
      class="pointer-events-none absolute right-0 bottom-0 left-0 translate-y-1 px-2 py-1.5 text-[11px] leading-[1.45] opacity-0 transition-all duration-250 ease-[var(--ease-soft)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      style="background: var(--color-ink); color: var(--color-dim)"
    >
      {note}
    </span>
  </span>

  <span class="flex items-baseline justify-between gap-2 pt-1.5 pb-0.5">
    <span class="font-mono text-[11.5px] tracking-tight transition-opacity duration-200 group-hover:opacity-100 sm:opacity-70">
      {name}
    </span>
    <span class="font-mono text-[9.5px] tracking-[0.16em] text-faint uppercase">{generator}</span>
  </span>
</button>
