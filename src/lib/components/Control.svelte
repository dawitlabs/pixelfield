<script lang="ts">
  interface Props {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    hint?: string;
    oninput: (value: number) => void;
  }

  let { label, value, min, max, step, hint = '', oninput }: Props = $props();
</script>

<label class="block">
  <span class="flex items-baseline justify-between gap-3">
    <span class="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">{label}</span>
    <span class="num text-[11.5px] text-paper">{value.toFixed(2)}</span>
  </span>
  <input
    type="range"
    {min}
    {max}
    {step}
    {value}
    data-blobity
    oninput={(e) => oninput(Number(e.currentTarget.value))}
    class="mt-2 w-full"
    aria-label={label}
  />
  {#if hint}
    <span class="mt-1 block text-[11px] leading-[1.45] text-faint">{hint}</span>
  {/if}
</label>
