<script lang="ts">
  import { Check, Copy } from 'lucide-svelte';

  interface Props {
    code: string;
    title?: string;
  }

  let { code, title = '' }: Props = $props();
  let isCopied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      isCopied = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        isCopied = false;
      }, 2000);
    } catch {
      isCopied = false;
    }
  }
</script>

<figure class="card overflow-hidden">
  <figcaption class="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
    <span class="tag truncate">{title}</span>
    <button
      type="button"
      onclick={copy}
      data-copied={isCopied}
      class="flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] text-faint transition-all duration-200 ease-[var(--ease-spring)] hover:bg-raised hover:text-ice active:scale-92 data-[copied=true]:text-success"
    >
      {#if isCopied}
        <Check size={12.5} aria-hidden="true" />
        copied
      {:else}
        <Copy size={12.5} aria-hidden="true" />
        copy
      {/if}
    </button>
  </figcaption>
  <pre class="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.8] text-muted"><code>{code}</code></pre>
</figure>
