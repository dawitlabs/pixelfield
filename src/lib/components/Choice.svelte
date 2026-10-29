<script lang="ts">
  interface Props {
    label: string;
    value: string;
    options: readonly string[];
    onpick: (value: string) => void;
  }

  let { label, value, options, onpick }: Props = $props();
</script>

<div>
  <span class="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">{label}</span>
  <div class="mt-2 flex flex-wrap gap-px" style="background: var(--color-hairline-soft)">
    {#each options as option (option)}
      <button
        type="button"
        data-blobity
        onclick={() => onpick(option)}
        data-active={value === option}
        class="flex-1 px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors duration-150 data-[active=true]:text-ink"
        style="background: {value === option ? 'var(--color-paper)' : 'var(--color-ink)'}; color: {value ===
        option
          ? 'var(--color-ink)'
          : 'var(--color-dim)'}"
      >
        {option}
      </button>
    {/each}
  </div>
</div>
