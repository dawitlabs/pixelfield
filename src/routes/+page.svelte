<script lang="ts">
  import { GENERATOR_NAMES, type FieldGenerator, type FieldPreset } from '@dawitlabs/pixelfield';
  import Field from '@dawitlabs/pixelfield/svelte';
  import { ArrowRight, Check, Copy } from 'lucide-svelte';
  import EffectCard from '$lib/components/EffectCard.svelte';
  import EffectDialog from '$lib/components/EffectDialog.svelte';
  import { EFFECTS, GENERATOR_META, TINTS } from '$lib/data';

  const MANAGERS = ['pnpm', 'npm', 'bun'] as const;

  let family = $state<FieldGenerator | 'all'>('all');
  let tint = $state('#ff5e00');
  let open = $state<FieldPreset | null>(null);
  let manager = $state<(typeof MANAGERS)[number]>('pnpm');
  let isCopied = $state(false);

  const shown = $derived(family === 'all' ? EFFECTS : EFFECTS.filter((e) => e.generator === family));
  const install = $derived(`${manager}${manager === 'npm' ? ' install' : ' add'} @dawitlabs/pixelfield`);

  async function copyInstall(): Promise<void> {
    try {
      await navigator.clipboard.writeText(install);
      isCopied = true;
      setTimeout(() => (isCopied = false), 2000);
    } catch {
      isCopied = false;
    }
  }
</script>

<svelte:head>
  <title>pixelfield — 26 dithered pixel effects for canvas</title>
  <meta
    name="description"
    content="Twenty-six animated ordered-dither pixel effects across six generator families. Copy the source into your project with one command."
  />
</svelte:head>

<main class="mx-auto max-w-6xl px-5">
  <section class="grid items-center gap-8 pt-16 pb-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:pt-24">
    <div>
      <span class="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface py-1 pr-3 pl-2.5">
        <span class="blip h-1.5 w-1.5 rounded-full bg-amber"></span>
        <span class="tag">26 effects · 6 families · zero deps</span>
      </span>

      <h1 class="display mt-6 max-w-[11ch] text-[clamp(2.4rem,4.6vw,3.5rem)]">
        Pixel effects you copy, not install.
      </h1>

      <p class="mt-5 max-w-md text-[15.5px] leading-[1.65] text-muted">
        Ordered dither over generated scalar fields, written straight into canvas
        <span class="font-mono text-[13.5px] text-ice">ImageData</span>. Run one command and the
        source lands in your repo. You own it after that.
      </p>

      <div class="mt-7 card overflow-hidden">
        <div class="flex items-center gap-1 border-b border-hairline p-1.5">
          {#each MANAGERS as m (m)}
            <button
              type="button"
              onclick={() => (manager = m)}
              data-active={manager === m}
              class="rounded-xs px-2.5 py-1.5 font-mono text-[11.5px] text-faint transition-colors duration-200 hover:text-ice data-[active=true]:bg-raised data-[active=true]:text-ice"
            >
              {m}
            </button>
          {/each}
          <button
            type="button"
            onclick={copyInstall}
            class="ml-auto flex items-center gap-1.5 rounded-xs px-2.5 py-1.5 font-mono text-[11.5px] text-faint transition-all duration-200 ease-[var(--ease-spring)] hover:bg-raised hover:text-ice active:scale-92"
            aria-label="Copy install command"
          >
            {#if isCopied}<Check size={12.5} /> copied{:else}<Copy size={12.5} /> copy{/if}
          </button>
        </div>
        <code class="block overflow-x-auto px-4 py-3.5 font-mono text-[13px] whitespace-nowrap">
          <span class="text-faint">$</span>
          {install}
        </code>
      </div>

      <a
        href="#gallery"
        class="mt-4 inline-flex items-center gap-1.5 rounded-xs bg-amber px-4 py-2.5 text-[13.5px] font-semibold text-obsidian transition-transform duration-200 ease-[var(--ease-spring)] hover:-translate-y-0.5 active:scale-97"
      >
        Browse all 26
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    </div>

    <div class="card overflow-hidden p-0">
      <div class="grid grid-cols-2 gap-px bg-hairline">
        {#each ['plasma', 'ripple', 'circuit', 'galaxy'] as const as preset (preset)}
          <div class="relative aspect-4/3 bg-obsidian">
            <Field {preset} {tint} seed={5} interactive={false} />
            <span class="tag absolute bottom-2 left-2.5 !text-ice/70">{preset}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section id="gallery" class="scroll-mt-24 pt-10">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="tag">gallery</p>
        <h2 class="display mt-2.5 text-[clamp(1.7rem,3.2vw,2.3rem)]">
          {shown.length}
          {family === 'all' ? 'effects' : GENERATOR_META[family].label.toLowerCase()}
        </h2>
      </div>

      <div class="flex flex-wrap items-center gap-1.5">
        {#each TINTS as swatch (swatch.name)}
          <button
            type="button"
            onclick={() => (tint = swatch.hex)}
            data-active={tint === swatch.hex}
            class="h-6 w-6 rounded-xs border border-hairline transition-transform duration-200 ease-[var(--ease-spring)] hover:scale-110 data-[active=true]:border-ice data-[active=true]:ring-2 data-[active=true]:ring-ice/20"
            style={swatch.hex
              ? `background:${swatch.hex}`
              : 'background:repeating-linear-gradient(45deg,#22262f 0 4px,#12141a 4px 8px)'}
            aria-label="Tint {swatch.name}"
            aria-pressed={tint === swatch.hex}
          ></button>
        {/each}
      </div>
    </div>

    <div class="mt-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Effect family">
      <button
        type="button"
        role="tab"
        aria-selected={family === 'all'}
        onclick={() => (family = 'all')}
        data-active={family === 'all'}
        class="rounded-full border border-hairline px-3.5 py-1.5 font-mono text-[11.5px] text-muted transition-colors duration-200 hover:text-ice data-[active=true]:border-amber data-[active=true]:bg-amber data-[active=true]:text-obsidian"
      >
        all {EFFECTS.length}
      </button>
      {#each GENERATOR_NAMES as generator (generator)}
        <button
          type="button"
          role="tab"
          aria-selected={family === generator}
          onclick={() => (family = generator)}
          data-active={family === generator}
          class="rounded-full border border-hairline px-3.5 py-1.5 font-mono text-[11.5px] text-muted transition-colors duration-200 hover:text-ice data-[active=true]:border-amber data-[active=true]:bg-amber data-[active=true]:text-obsidian"
        >
          {generator} {EFFECTS.filter((e) => e.generator === generator).length}
        </button>
      {/each}
    </div>

    {#if family !== 'all'}
      <p class="mt-4 text-[14px] leading-[1.6] text-muted">{GENERATOR_META[family].blurb}</p>
    {/if}

    <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {#each shown as effect (effect.name)}
        <EffectCard name={effect.name} {tint} onopen={(n) => (open = n)} />
      {/each}
    </div>

    {#if shown.length === 0}
      <p class="mt-10 text-center text-[14px] text-faint">No effects in that family yet.</p>
    {/if}
  </section>

  <section class="pt-20">
    <p class="tag">how it ships</p>
    <h2 class="display mt-2.5 text-[clamp(1.7rem,3.2vw,2.3rem)]">Three steps</h2>
    <div class="mt-6 grid gap-3 sm:grid-cols-3">
      {#each [{ n: '01', t: 'Init', b: 'npx @dawitlabs/pixelfield init svelte — writes pixelfield.json with your framework and output path.' }, { n: '02', t: 'Add', b: 'npx @dawitlabs/pixelfield add ripple galaxy — copies real source files into your project.' }, { n: '03', t: 'Own', b: 'Every option is inlined in the file. Edit it, rename it, delete the parts you do not need.' }] as step (step.n)}
        <div class="card p-5 transition-transform duration-300 ease-[var(--ease-spring)] hover:-translate-y-1">
          <span class="grid h-7 w-7 place-items-center rounded-xs bg-amber font-mono text-[11px] font-semibold text-obsidian">
            {step.n}
          </span>
          <h3 class="mt-3.5 font-display text-[15px] font-semibold">{step.t}</h3>
          <p class="mt-2 text-[13.5px] leading-[1.65] text-muted">{step.b}</p>
        </div>
      {/each}
    </div>
  </section>
</main>

<EffectDialog name={open} {tint} onclose={() => (open = null)} />
