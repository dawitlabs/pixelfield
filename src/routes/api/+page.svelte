<script lang="ts">
  import { PRESETS, PRESET_NAMES } from '@dawitlabs/pixelfield';
  import Code from '$lib/components/Code.svelte';
  import Mark from '$lib/components/Mark.svelte';
  import { EFFECT_NOTES, OPTIONS } from '$lib/data';

  const HANDLE = `const field = createField(canvas, { preset: 'terrain' });

field.update({ warp: 2.2 });
field.destroy();`;

  const COLUMNS = ['generator', 'falloff', 'mode', 'scale', 'aspect', 'warp', 'contrast', 'speed'] as const;

  const EXPORTS = [
    { name: 'createField', sig: '(canvas, options?) => FieldHandle', note: 'Mounts the renderer. Draws one frame synchronously.' },
    { name: 'PRESETS', sig: 'Record<FieldPreset, PresetShape>', note: 'Every preset and its exact values.' },
    { name: 'PRESET_NAMES', sig: 'FieldPreset[]', note: 'All 26 names, in catalogue order.' },
    { name: 'GENERATOR_NAMES', sig: 'FieldGenerator[]', note: 'The six scalar field families.' },
    { name: 'packPalette', sig: '(colors) => Uint32Array', note: 'Packs RGBA tuples into the compositor layout.' },
    { name: 'paletteFromTint', sig: '(hex, theme) => Uint32Array', note: 'Builds the seven step ramp. Throws on a non hex value.' },
  ];
</script>

<svelte:head>
  <title>Reference — pixelfield</title>
  <meta name="description" content="Every pixelfield option, preset value and export." />
</svelte:head>

<main class="mx-auto max-w-6xl px-5">
  <header class="border-b border-hairline-soft py-16">
    <p class="tag">reference</p>
    <h1 class="display mt-4 text-[clamp(2.4rem,6vw,4.5rem)]">
      Every <span class="accent-serif italic">knob</span>
    </h1>
    <p class="mt-5 max-w-md text-[15px] leading-[1.65] text-dim">
      One object. Accepted by <span class="font-mono text-[13px] text-paper">createField</span>,
      both component bindings, and <span class="font-mono text-[13px] text-paper">update()</span>.
    </p>
  </header>

  <section class="pt-14">
    <div class="flex items-center gap-2.5">
      <Mark size={11} />
      <p class="tag">01 — options</p>
    </div>

    <div class="mt-6 border-t border-hairline-soft">
      {#each OPTIONS as option (option.name)}
        <div
          class="grid grid-cols-1 gap-2 border-b border-hairline-soft py-5 transition-colors duration-200 hover:bg-surface sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-8"
        >
          <div>
            <p class="font-mono text-[13.5px] text-paper">{option.name}</p>
            <p class="mt-1.5 font-mono text-[11px] leading-[1.5] text-faint">{option.type}</p>
          </div>
          <div>
            <p class="text-[14px] leading-[1.65] text-dim">{option.note}</p>
            <p class="mt-1.5 font-mono text-[11px] text-faint">default {option.fallback}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="pt-16">
    <div class="flex items-center gap-2.5">
      <Mark size={11} />
      <p class="tag">02 — preset values</p>
    </div>
    <h2 class="display mt-4 text-[clamp(1.6rem,3vw,2.2rem)]">
      Nothing <span class="accent-serif italic">hidden</span>
    </h2>

    <div class="mt-6 overflow-x-auto border-t border-hairline-soft">
      <table class="w-full border-collapse text-left font-mono text-[12px]">
        <thead>
          <tr class="border-b border-hairline-soft">
            <th scope="col" class="tag py-3 pr-4 font-normal">preset</th>
            {#each COLUMNS as column (column)}
              <th scope="col" class="tag px-3 py-3 font-normal">{column}</th>
            {/each}
            <th scope="col" class="tag px-3 py-3 font-normal">flow</th>
          </tr>
        </thead>
        <tbody>
          {#each PRESET_NAMES as name (name)}
            <tr class="border-b border-hairline-soft transition-colors duration-200 hover:bg-surface">
              <th scope="row" class="py-3 pr-4 text-left font-medium text-paper">{name}</th>
              {#each COLUMNS as column (column)}
                <td class="px-3 py-3 whitespace-nowrap text-dim">{PRESETS[name][column]}</td>
              {/each}
              <td class="px-3 py-3 whitespace-nowrap text-dim">
                {PRESETS[name].flow.x},{PRESETS[name].flow.y}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mt-8 grid gap-px border border-hairline-soft bg-[var(--color-hairline-soft)] sm:grid-cols-2">
      {#each PRESET_NAMES as name (name)}
        <div class="bg-ink px-4 py-3.5">
          <p class="font-mono text-[12.5px] text-paper">{name}</p>
          <p class="mt-1 text-[13px] leading-[1.6] text-dim">{EFFECT_NOTES[name]}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="pt-16">
    <div class="flex items-center gap-2.5">
      <Mark size={11} />
      <p class="tag">03 — handle &amp; exports</p>
    </div>
    <h2 class="display mt-4 text-[clamp(1.6rem,3vw,2.2rem)]">
      Two <span class="accent-serif italic">methods</span>
    </h2>

    <div class="mt-6 grid gap-8 lg:grid-cols-2">
      <div>
        <Code code={HANDLE} title="vanilla" />
        <ul class="mt-5 space-y-3 text-[13.5px] leading-[1.7] text-dim">
          <li>
            <span class="font-mono text-[12.5px] text-paper">update</span> merges options, rebuilds
            the palette and ramp, redraws. Never rebuilds the noise tables.
          </li>
          <li>
            <span class="font-mono text-[12.5px] text-paper">destroy</span> cancels the frame,
            disconnects the ResizeObserver, removes every listener.
          </li>
        </ul>
      </div>

      <div class="border-t border-hairline-soft">
        {#each EXPORTS as item (item.name)}
          <div class="border-b border-hairline-soft py-4">
            <p class="font-mono text-[13px] text-paper">{item.name}</p>
            <p class="mt-1 overflow-x-auto font-mono text-[11px] whitespace-nowrap text-faint">{item.sig}</p>
            <p class="mt-1.5 text-[13px] leading-[1.6] text-dim">{item.note}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
</main>
