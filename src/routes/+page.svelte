<script lang="ts">
  import { GENERATOR_NAMES, type FieldGenerator, type FieldPreset } from '@dawitlabs/pixelfield';
  import Field from '@dawitlabs/pixelfield/svelte';
  import { onMount } from 'svelte';
  import EffectCard from '$lib/components/EffectCard.svelte';
  import EffectDialog from '$lib/components/EffectDialog.svelte';
  import Mark from '$lib/components/Mark.svelte';
  import { EFFECTS, FEATURED, GENERATOR_META } from '$lib/data';
  import { fieldTheme, fieldTint, mode } from '$lib/mode.svelte';

  const MANAGERS = ['pnpm', 'npm', 'bun'] as const;
  const CYCLE: FieldPreset[] = ['marble', 'nebula', 'plasma', 'terrain', 'current', 'aurora'];

  let family = $state<FieldGenerator | 'all'>('all');
  let open = $state<FieldPreset | null>(null);
  let manager = $state<(typeof MANAGERS)[number]>('pnpm');
  let isCopied = $state(false);
  let heroIndex = $state(0);

  const hero = $derived(CYCLE[heroIndex % CYCLE.length]);
  const shown = $derived(family === 'all' ? EFFECTS : EFFECTS.filter((e) => e.generator === family));
  const install = $derived(`${manager}${manager === 'npm' ? ' install' : ' add'} @dawitlabs/pixelfield`);

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => (heroIndex += 1), 5600);
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
    content="Twenty-six animated 1-bit dither effects for canvas. Copy the source into your project — zero runtime dependencies."
  />
</svelte:head>

<section class="relative isolate overflow-hidden border-b border-hairline-soft">
  <div class="absolute inset-0 -z-10 opacity-80">
    {#key hero}
      <div class="absolute inset-0 animate-[rise-in_1.4s_var(--ease-soft)_both]">
        <Field preset={hero} tint={fieldTint(mode.current)} theme={fieldTheme(mode.current)} seed={6} intensity={1} />
      </div>
    {/key}
  </div>
  <div
    class="absolute inset-0 -z-10"
    style="background: linear-gradient(180deg, color-mix(in srgb, var(--color-ink) 52%, transparent), color-mix(in srgb, var(--color-ink) 32%, transparent) 38%, color-mix(in srgb, var(--color-ink) 96%, transparent))"
  ></div>

  <div class="mx-auto flex min-h-[86svh] max-w-6xl flex-col justify-end px-5 pt-28 pb-16">
    <div class="rise">
      <h1 class="display max-w-[16ch] text-[clamp(2.8rem,7.4vw,6rem)]">
        Create with no
        <span class="accent-serif italic">limitations</span>
      </h1>

      <div class="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <p class="max-w-sm text-[15px] leading-[1.65] text-dim">
          Twenty-six animated 1-bit dither effects, drawn straight into canvas
          <span class="font-mono text-[13px] text-paper">ImageData</span>. One command puts the
          source in your repo.
        </p>

        <div class="w-full max-w-md">
          <div class="overflow-hidden rounded-md border border-hairline">
            <div class="flex items-center gap-4 border-b border-hairline-soft px-4 py-2.5">
              {#each MANAGERS as m (m)}
                <button
                  type="button"
                  onclick={() => (manager = m)}
                  data-active={manager === m}
                  class="mono-label border-b border-transparent pb-0.5 text-[11.5px] transition-colors duration-200 hover:text-paper data-[active=true]:border-paper data-[active=true]:text-paper"
                >
                  {m}
                </button>
              {/each}
              <button
                type="button"
                onclick={copyInstall}
                class="mono-label ml-auto text-[11.5px] transition-colors duration-200 hover:text-paper"
                aria-label="Copy install command"
              >
                {isCopied ? 'copied' : 'copy'}
              </button>
            </div>
            <code class="block overflow-x-auto px-4 py-3.5 font-mono text-[13px] whitespace-nowrap">
              <span class="text-faint">$</span>
              {install}
            </code>
          </div>

          <div class="mt-3 flex items-center gap-3">
            <a
              href="#effects"
              class="rounded-pill bg-paper px-5 py-2.5 text-[13px] font-600 text-ink transition-transform duration-200 ease-[var(--ease-spring)] hover:-translate-y-0.5 active:scale-97"
            >
              Browse 26 effects
            </a>
            <a
              href="/api/"
              class="rounded-pill border border-hairline px-5 py-2.5 text-[13px] font-500 transition-colors duration-200 hover:border-paper"
            >
              Reference
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="effects" class="mx-auto max-w-6xl scroll-mt-16 px-5 pt-16">
  <div class="flex flex-wrap items-end justify-between gap-5">
    <div>
      <p class="tag">the set</p>
      <h2 class="display mt-3 text-[clamp(1.8rem,3.4vw,2.6rem)]">
        {shown.length} effects,
        <span class="accent-serif italic">six families</span>
      </h2>
      {#if family !== 'all'}
        <p class="mt-2 max-w-md text-[13.5px] leading-[1.6] text-dim">{GENERATOR_META[family].blurb}</p>
      {/if}
    </div>
  </div>

  <div class="mt-6 flex flex-wrap gap-5 border-b border-hairline-soft pb-4" role="tablist" aria-label="Effect family">
    <button
      type="button"
      role="tab"
      aria-selected={family === 'all'}
      onclick={() => (family = 'all')}
      data-active={family === 'all'}
      class="mono-label border-b border-transparent pb-1 transition-colors duration-200 hover:text-paper data-[active=true]:border-paper data-[active=true]:text-paper"
    >
      All <span class="num text-faint">{EFFECTS.length}</span>
    </button>
    {#each GENERATOR_NAMES as generator (generator)}
      <button
        type="button"
        role="tab"
        aria-selected={family === generator}
        onclick={() => (family = generator)}
        data-active={family === generator}
        class="mono-label border-b border-transparent pb-1 transition-colors duration-200 hover:text-paper data-[active=true]:border-paper data-[active=true]:text-paper"
      >
        {generator} <span class="num text-faint">{EFFECTS.filter((e) => e.generator === generator).length}</span>
      </button>
    {/each}
  </div>

  {#key family}
    <div class="mt-6 grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[11.5rem] sm:grid-cols-4">
      {#each shown as effect, i (effect.name)}
        <EffectCard
          name={effect.name}
          generator={effect.generator}
          note={effect.note}
          tint={fieldTint(mode.current)}
          fieldTheme={fieldTheme(mode.current)}
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
  <h2 class="display mt-3 text-[clamp(1.8rem,3.4vw,2.6rem)]">
    Copy, <span class="accent-serif italic">don't install</span>
  </h2>
  <div class="mt-8 grid gap-px border border-hairline-soft bg-[var(--color-hairline-soft)] sm:grid-cols-3">
    {#each [{ n: '01', t: 'Init', b: 'One command writes pixelfield.json with your framework and output path.' }, { n: '02', t: 'Add', b: 'Name the effects you want. Real source files land in your project.' }, { n: '03', t: 'Own', b: 'Every option is inlined. Edit it, rename it, delete what you do not need.' }] as step (step.n)}
      <div class="bg-ink p-7">
        <div class="flex items-center gap-2.5">
          <Mark size={11} />
          <span class="num text-[11px] text-faint">{step.n}</span>
        </div>
        <h3 class="mt-4 text-[17px] font-500 tracking-tight">{step.t}</h3>
        <p class="mt-2 text-[13.5px] leading-[1.65] text-dim">{step.b}</p>
      </div>
    {/each}
  </div>
</section>

<EffectDialog name={open} tint={fieldTint(mode.current)} fieldTheme={fieldTheme(mode.current)} onclose={() => (open = null)} />
