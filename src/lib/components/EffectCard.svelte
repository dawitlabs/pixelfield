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
  style="animation-delay: {Math.min(index * 30, 480)}ms"
  class="rise group relative flex h-full flex-col overflow-hidden rounded-md border border-hairline-soft bg-ink text-left transition-[border-color,transform] duration-400 ease-[var(--ease-spring)] hover:-translate-y-1 hover:border-paper focus-visible:-translate-y-1 {span
    ? 'sm:col-span-2 sm:row-span-2'
    : ''}"
  aria-label="Open {name}"
>
  <span class="relative block min-h-0 flex-1">
    <Field preset={name} {tint} theme={fieldTheme} {seed} interactive={false} />
  </span>

  <span class="flex items-baseline justify-between gap-2 border-t border-hairline-soft px-3.5 py-2.5">
    <span class="text-[14px] font-500 tracking-tight">{name}</span>
    <span class="tag">{generator}</span>
  </span>

  <span
    class="pointer-events-none absolute inset-x-0 bottom-[42px] translate-y-2 bg-ink/92 px-3.5 py-2.5 text-[12.5px] leading-[1.5] text-dim opacity-0 backdrop-blur-sm transition-all duration-300 ease-[var(--ease-soft)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
  >
    {note}
  </span>
</button>
