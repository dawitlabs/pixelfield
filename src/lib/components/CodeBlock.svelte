<script lang="ts">
  import { Check, Copy } from 'lucide-svelte';

  interface Props {
    code: string;
    title?: string;
    lang?: string;
  }

  let { code, title = '', lang = 'ts' }: Props = $props();
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

<figure class="overflow-hidden rounded-md border border-line bg-raised">
  <figcaption
    class="flex items-center justify-between gap-3 border-b border-line bg-paper px-3 py-2"
  >
    <span class="label truncate">{title || lang}</span>
    <button
      type="button"
      onclick={copy}
      class="flex shrink-0 items-center gap-1.5 rounded-xs px-2 py-1 font-mono text-[11px] text-muted transition-colors duration-150 hover:bg-accent-soft hover:text-ink"
      aria-label={isCopied ? 'Copied to clipboard' : 'Copy code to clipboard'}
    >
      {#if isCopied}
        <Check size={13} aria-hidden="true" />
        copied
      {:else}
        <Copy size={13} aria-hidden="true" />
        copy
      {/if}
    </button>
  </figcaption>
  <pre class="overflow-x-auto p-3.5 font-mono text-[12.5px] leading-6"><code>{code}</code></pre>
</figure>
