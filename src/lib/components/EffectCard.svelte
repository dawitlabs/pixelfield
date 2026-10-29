<script lang="ts">
  import Field from '@dawitlabs/pixelfield/svelte';
  import type { FieldPreset } from '@dawitlabs/pixelfield';

  interface Props {
    name: FieldPreset;
    tint?: string;
    seed?: number;
    onopen?: (name: FieldPreset) => void;
  }

  let { name, tint = undefined, seed = 3, onopen }: Props = $props();
</script>

<button
  type="button"
  onclick={() => onopen?.(name)}
  class="group relative block w-full overflow-hidden rounded-sm border border-hairline bg-surface text-left transition-[transform,border-color,box-shadow] duration-300 ease-[var(--ease-spring)] hover:-translate-y-1 hover:border-amber/60 hover:shadow-[var(--shadow-float)]"
  aria-label="Open {name}"
>
  <span class="relative block aspect-4/3 overflow-hidden bg-obsidian">
    <Field preset={name} {tint} {seed} interactive={false} />
    <span
      class="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <span class="rounded-full bg-amber px-3.5 py-1.5 text-[11.5px] font-semibold text-obsidian">View</span>
    </span>
  </span>
  <span class="flex items-center justify-between gap-2 border-t border-hairline px-3 py-2.5">
    <span class="font-mono text-[11.5px] tracking-[0.1em] text-muted uppercase transition-colors duration-200 group-hover:text-ice">
      {name}
    </span>
    <span class="h-1 w-1 rounded-full bg-amber opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
  </span>
</button>
