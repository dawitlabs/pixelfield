<script lang="ts">
  import { GENERATOR_NAMES, type FieldGenerator, type FieldPreset } from '@dawitlabs/pixelfield';
  import Field from '@dawitlabs/pixelfield/svelte';
  import { ArrowUpRight, Check, Copy } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import EffectCard from '$lib/components/EffectCard.svelte';
  import EffectDialog from '$lib/components/EffectDialog.svelte';
  import { EFFECTS, EFFECT_TINT, FEATURED, GENERATOR_META, TINTS } from '$lib/data';

  const MANAGERS = ['pnpm', 'npm', 'bun'] as const;
  const CYCLE: FieldPreset[] = ['plasma', 'aurora', 'galaxy', 'marble', 'current', 'nebula'];

  let family = $state<FieldGenerator | 'all'>('all');
  let override = $state('');
  let open = $state<FieldPreset | null>(null);
  let manager = $state<(typeof MANAGERS)[number]>('pnpm');
  let isCopied = $state(false);
  let heroIndex = $state(0);

  const hero = $derived(CYCLE[heroIndex % CYCLE.length]);
  const shown = $derived(family === 'all' ? EFFECTS : EFFECTS.filter((e) => e.generator === family));
  const install = $derived(`${manager}${manager === 'npm' ? ' install' : ' add'} @dawitlabs/pixelfield`);

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => (heroIndex += 1), 5200);
    return () => clearInterval(id);
  });

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
    content="Twenty-six animated ordered-dither pixel effects across six generator families. Copy the source into your project — zero runtime dependencies."
  />
</svelte:head>

<section class="relative isolate min-h-[88svh] overflow-hidden">
  <div class="absolute inset-0 -z-10">
    {#key hero}
      <div class="absolute inset-0 animate-[rise-in_1.2s_var(--ease-soft)_both]">
        <Field preset={hero} tint={EFFECT_TINT[hero]} seed={6} intensity={1.05} />
      </div>
    {/key}
  </div>
  <div
    class="absolute inset-0 -z-10 bg-[radial-gradient(120%_85%_at_15%_10%,rgba(10,11,14,0.94),rgba(10,11,14,0.62)_45%,rgba(10,11,14,0.9))]"
  ></div>

  <div class="mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-end px-5 pt-32 pb-14">
    <div class="rise">
      <div class="flex items-center gap-2.5">
        <span class="blip h-1.5 w-1.5 rounded-full" style="background: {EFFECT_TINT[hero]}"></span>
        <span class="tag">now rendering · {hero}</span>
      </div>

      <h1 class="display mt-5 max-w-[14ch] text-[clamp(3rem,8.5vw,7rem)]">
        Pixels with<br />
        <span class="italic" style="color: {EFFECT_TINT[hero]}; transition: color 900ms var(--ease-soft)">
          weather.
        </span>
      </h1>

      <div class="mt-8 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <p class="max-w-md text-[16px] leading-[1.6] text-muted">
          Twenty-six animated dither fields, drawn straight into canvas
          <span class="font-mono text-[14px] text-ice">ImageData</span>. Run one command and the
          source lands in your repo. You own it after that.
        </p>

        <div class="w-full max-w-sm">
          <div class="card overflow-hidden backdrop-blur-xl">
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
          <div class="mt-2.5 flex gap-4">
            <a href="#gallery" class="group inline-flex items-center gap-1 text-[13.5px] font-medium text-ice">
              Browse 26 effects
              <ArrowUpRight size={14} class="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href="/api/" class="text-[13.5px] text-muted transition-colors hover:text-ice">Reference</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="gallery" class="mx-auto max-w-6xl scroll-mt-20 px-5 pt-20">
  <div class="flex flex-wrap items-end justify-between gap-5">
    <div>
      <p class="tag">the set</p>
      <h2 class="display mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)]">
        {shown.length}
        {family === 'all' ? 'effects, six families' : GENERATOR_META[family].label.toLowerCase()}
      </h2>
      {#if family !== 'all'}
        <p class="mt-2 max-w-md text-[14px] leading-[1.6] text-muted">{GENERATOR_META[family].blurb}</p>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      <span class="tag">tint</span>
      {#each TINTS as swatch (swatch.name)}
        <button
          type="button"
          onclick={() => (override = swatch.hex)}
          data-active={override === swatch.hex}
          class="h-5 w-5 rounded-full border border-hairline transition-transform duration-200 ease-[var(--ease-spring)] hover:scale-125 data-[active=true]:ring-2 data-[active=true]:ring-ice/70 data-[active=true]:ring-offset-2 data-[active=true]:ring-offset-obsidian"
          style={swatch.hex
            ? `background:${swatch.hex}`
            : 'background:conic-gradient(#8ab4ff,#9ee36a,#ffc86b,#ff6f91,#c49cff,#8ab4ff)'}
          aria-label="Tint {swatch.name}"
          aria-pressed={override === swatch.hex}
        ></button>
      {/each}
    </div>
  </div>

  <div class="mt-6 flex flex-wrap gap-1.5" role="tablist" aria-label="Effect family">
    <button
      type="button"
      role="tab"
      aria-selected={family === 'all'}
      onclick={() => (family = 'all')}
      data-active={family === 'all'}
      class="rounded-full border border-hairline px-3.5 py-1.5 font-mono text-[11.5px] text-muted transition-all duration-200 hover:border-hairline-strong hover:text-ice data-[active=true]:border-ice data-[active=true]:bg-ice data-[active=true]:text-obsidian"
    >
      all · {EFFECTS.length}
    </button>
    {#each GENERATOR_NAMES as generator (generator)}
      <button
        type="button"
        role="tab"
        aria-selected={family === generator}
        onclick={() => (family = generator)}
        data-active={family === generator}
        class="rounded-full border border-hairline px-3.5 py-1.5 font-mono text-[11.5px] text-muted transition-all duration-200 hover:border-hairline-strong hover:text-ice data-[active=true]:border-ice data-[active=true]:bg-ice data-[active=true]:text-obsidian"
      >
        {generator} · {EFFECTS.filter((e) => e.generator === generator).length}
      </button>
    {/each}
  </div>

  {#key family + override}
    <div class="mt-7 grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[11.5rem] sm:grid-cols-4">
      {#each shown as effect, i (effect.name)}
        <EffectCard
          name={effect.name}
          generator={effect.generator}
          note={effect.note}
          tint={override || undefined}
          span={family === 'all' && (FEATURED as readonly string[]).includes(effect.name)}
          index={i}
          onopen={(n) => (open = n)}
        />
      {/each}
    </div>
  {/key}
</section>

<section class="mx-auto max-w-6xl px-5 pt-24">
  <p class="tag">how it ships</p>
  <h2 class="display mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)]">Copy, don't install</h2>
  <div class="mt-7 grid gap-3 sm:grid-cols-3">
    {#each [{ n: '01', t: 'Init', c: '#8ab4ff', b: 'One command writes pixelfield.json with your framework and output path.' }, { n: '02', t: 'Add', c: '#9ee36a', b: 'Name the effects you want. Real source files land in your project.' }, { n: '03', t: 'Own', c: '#ffc86b', b: 'Every option is inlined. Edit it, rename it, delete what you do not need.' }] as step (step.n)}
      <div
        class="card group p-6 transition-[transform,border-color] duration-400 ease-[var(--ease-spring)] hover:-translate-y-1.5"
        style="--c: {step.c}"
      >
        <span class="num text-[11px] tracking-[0.2em]" style="color: var(--c)">{step.n}</span>
        <h3 class="mt-3 font-display text-[18px] font-600 tracking-tight">{step.t}</h3>
        <p class="mt-2 text-[13.5px] leading-[1.65] text-muted">{step.b}</p>
      </div>
    {/each}
  </div>
</section>

<EffectDialog name={open} tint={override || undefined} onclose={() => (open = null)} />
