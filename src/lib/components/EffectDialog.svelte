<script lang="ts">
  import Field from '@dawitlabs/pixelfield/svelte';
  import { PRESETS, type FieldPreset } from '@dawitlabs/pixelfield';
  import { Check, Copy, X } from 'lucide-svelte';
  import { EFFECT_NOTES, GENERATOR_META, sourceFor } from '$lib/data';

  interface Props {
    name: FieldPreset | null;
    tint?: string;
    onclose: () => void;
  }

  let { name, tint = undefined, onclose }: Props = $props();

  const FRAMEWORKS = ['svelte', 'react', 'vanilla'] as const;
  let framework = $state<(typeof FRAMEWORKS)[number]>('svelte');
  let copied = $state<'' | 'cli' | 'source'>('');
  let dialog = $state<HTMLDialogElement | null>(null);

  const options = $derived(name ? PRESETS[name] : null);
  const cli = $derived(`npx @dawitlabs/pixelfield add ${name ?? ''}`);
  const source = $derived(name && options ? sourceFor(framework, name, options) : '');

  $effect(() => {
    if (!dialog) return;
    if (name && !dialog.open) dialog.showModal();
    if (!name && dialog.open) dialog.close();
  });

  async function copy(what: 'cli' | 'source'): Promise<void> {
    try {
      await navigator.clipboard.writeText(what === 'cli' ? cli : source);
      copied = what;
      setTimeout(() => (copied = ''), 2000);
    } catch {
      copied = '';
    }
  }
</script>

<dialog
  bind:this={dialog}
  onclose={onclose}
  onclick={(e) => e.target === dialog && onclose()}
  class="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-md border border-hairline bg-surface p-0 text-ice shadow-[var(--shadow-float)] backdrop:bg-obsidian/80 backdrop:backdrop-blur-sm"
>
  {#if name && options}
    <div class="flex items-start justify-between gap-4 border-b border-hairline p-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-amber"></span>
          <h2 class="text-[17px] font-semibold">{name}</h2>
          <span class="tag">{GENERATOR_META[options.generator].label}</span>
        </div>
        <p class="mt-1.5 max-w-lg text-[13.5px] leading-[1.6] text-muted">{EFFECT_NOTES[name]}</p>
      </div>
      <button
        type="button"
        onclick={onclose}
        class="shrink-0 rounded-sm p-1.5 text-faint transition-colors duration-200 hover:bg-raised hover:text-ice"
        aria-label="Close"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>

    <div class="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="space-y-4">
        <div class="overflow-hidden rounded-sm border border-hairline bg-obsidian">
          <div class="h-48">
            <Field preset={name} {tint} seed={3} />
          </div>
        </div>
        <div class="rounded-sm border border-hairline bg-panel p-3">
          <p class="tag">options</p>
          <dl class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {#each Object.entries(options) as [key, value] (key)}
              <div class="flex items-baseline justify-between gap-2 border-b border-hairline/60 pb-1">
                <dt class="font-mono text-[11px] text-faint">{key}</dt>
                <dd class="num text-[11.5px] text-muted">
                  {typeof value === 'object' ? `${value.x},${value.y}` : String(value)}
                </dd>
              </div>
            {/each}
          </dl>
        </div>
      </div>

      <div class="space-y-3">
        <div class="rounded-sm border border-hairline bg-panel p-3">
          <div class="flex items-center justify-between gap-2">
            <p class="tag">add it</p>
            <button
              type="button"
              onclick={() => copy('cli')}
              class="flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] text-faint transition-all duration-200 ease-[var(--ease-spring)] hover:bg-raised hover:text-ice active:scale-92"
            >
              {#if copied === 'cli'}<Check size={12} /> copied{:else}<Copy size={12} /> copy{/if}
            </button>
          </div>
          <code class="mt-2 block overflow-x-auto font-mono text-[12px] whitespace-nowrap text-ice">{cli}</code>
        </div>

        <div class="overflow-hidden rounded-sm border border-hairline bg-obsidian">
          <div class="flex items-center gap-1 border-b border-hairline bg-panel p-1.5">
            {#each FRAMEWORKS as f (f)}
              <button
                type="button"
                onclick={() => (framework = f)}
                data-active={framework === f}
                class="rounded-sm px-2.5 py-1 font-mono text-[11px] text-faint transition-colors duration-200 hover:text-ice data-[active=true]:bg-raised data-[active=true]:text-ice"
              >
                {f}
              </button>
            {/each}
            <button
              type="button"
              onclick={() => copy('source')}
              class="ml-auto flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] text-faint transition-all duration-200 ease-[var(--ease-spring)] hover:bg-raised hover:text-ice active:scale-92"
            >
              {#if copied === 'source'}<Check size={12} /> copied{:else}<Copy size={12} /> copy{/if}
            </button>
          </div>
          <pre class="max-h-72 overflow-auto p-3.5 font-mono text-[11.5px] leading-[1.7] text-muted"><code>{source}</code></pre>
        </div>
      </div>
    </div>
  {/if}
</dialog>
