<script lang="ts">
  import { PRESETS, PRESET_NAMES } from '@dawitlabs/pixelfield';
  import Code from '$lib/components/Code.svelte';
  import { OPTIONS, PRESET_NOTES } from '$lib/data';

  const HANDLE = `const field = createField(canvas, { preset: 'terrain' });

field.update({ warp: 2.2 });
field.destroy();`;

  const COLUMNS = ['falloff', 'mode', 'scale', 'aspect', 'warp', 'contrast', 'speed', 'intensity'] as const;
</script>

<svelte:head>
  <title>Reference — pixelfield</title>
  <meta name="description" content="Every pixelfield option, preset value and export." />
</svelte:head>

<header class="border-b border-hairline flex items-baseline justify-between gap-4 px-5 py-6 lg:px-8">
  <a href="/" class="display text-2xl transition-opacity hover:opacity-70">pixelfield</a>
  <p class="tag">reference</p>
</header>

<section class="grid grid-cols-1 lg:grid-cols-[minmax(0,34%)_minmax(0,1fr)]">
  <div class="px-5 py-8 lg:px-8 lg:py-10">
    <p class="tag">01 — options</p>
    <h1 class="display mt-4 text-huge">Every<br />knob</h1>
    <p class="mt-5 max-w-xs text-[15px] leading-[1.6] text-muted">
      One object. Accepted by <span class="font-mono text-[13px] text-ice">createField</span>,
      both component bindings, and <span class="font-mono text-[13px] text-ice">update()</span>.
    </p>
  </div>
  <div class="grid gap-px bg-hair">
    {#each OPTIONS as option (option.name)}
      <div class="grid grid-cols-1 gap-1 bg-surface px-5 py-4 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:gap-4">
        <div>
          <p class="font-mono text-[13px] text-ice">{option.name}</p>
          <p class="mt-1 font-mono text-[11px] text-amber-text">{option.type}</p>
        </div>
        <div>
          <p class="text-[13.5px] leading-[1.65] text-muted">{option.note}</p>
          <p class="mt-1 font-mono text-[11px] text-faint">default {option.fallback}</p>
        </div>
      </div>
    {/each}
  </div>
</section>

<section class="border-t border-hairline grid grid-cols-1 lg:grid-cols-[minmax(0,34%)_minmax(0,1fr)]">
  <div class="px-5 py-8 lg:px-8 lg:py-10">
    <p class="tag">02 — presets</p>
    <h2 class="display mt-4 text-huge">Exact<br />values</h2>
    <p class="mt-5 max-w-xs text-[15px] leading-[1.6] text-muted">
      Nothing hidden. Every preset is these eight numbers plus a flow vector.
    </p>
  </div>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left font-mono text-[12px]">
      <thead>
        <tr class="border-b border-hairline">
          <th scope="col" class="tag px-4 py-3 font-normal">preset</th>
          {#each COLUMNS as column (column)}
            <th scope="col" class="tag px-3 py-3 font-normal">{column}</th>
          {/each}
          <th scope="col" class="tag px-3 py-3 font-normal">flow</th>
        </tr>
      </thead>
      <tbody>
        {#each PRESET_NAMES as name (name)}
          <tr class="border-b border-hairline last:border-0">
            <th scope="row" class="px-4 py-3 text-left font-medium text-amber-text">{name}</th>
            {#each COLUMNS as column (column)}
              <td class="px-3 py-3 whitespace-nowrap text-muted">{PRESETS[name][column]}</td>
            {/each}
            <td class="px-3 py-3 whitespace-nowrap text-muted">
              {PRESETS[name].flow.x},{PRESETS[name].flow.y}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="grid gap-px bg-hair sm:grid-cols-2">
      {#each PRESET_NAMES as name (name)}
        <div class="bg-surface px-4 py-4">
          <p class="font-mono text-[12px] text-ice">{name}</p>
          <p class="mt-1.5 text-[13px] leading-[1.6] text-muted">{PRESET_NOTES[name]}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="border-t border-hairline grid grid-cols-1 lg:grid-cols-[minmax(0,34%)_minmax(0,1fr)]">
  <div class="px-5 py-8 lg:px-8 lg:py-10">
    <p class="tag">03 — handle</p>
    <h2 class="display mt-4 text-huge">Two<br />methods</h2>
  </div>
  <div class="px-5 py-8 lg:px-8 lg:py-10">
    <Code code={HANDLE} title="vanilla" />
    <ul class="mt-6 space-y-3 text-[13.5px] leading-[1.7] text-muted">
      <li>
        <span class="font-mono text-[12.5px] text-ice">update</span> merges options, rebuilds the
        palette and ramp, redraws. Never rebuilds the noise tables.
      </li>
      <li>
        <span class="font-mono text-[12.5px] text-ice">destroy</span> cancels the frame,
        disconnects the ResizeObserver, removes every listener. Always call it.
      </li>
      <li>
        Exports: <span class="font-mono text-[12.5px] text-ice">createField</span>,
        <span class="font-mono text-[12.5px] text-ice">PRESETS</span>,
        <span class="font-mono text-[12.5px] text-ice">PRESET_NAMES</span>,
        <span class="font-mono text-[12.5px] text-ice">packPalette</span>,
        <span class="font-mono text-[12.5px] text-ice">paletteFromTint</span>,
        <span class="font-mono text-[12.5px] text-ice">DARK_PALETTE</span>,
        <span class="font-mono text-[12.5px] text-ice">LIGHT_PALETTE</span>.
      </li>
    </ul>
  </div>
</section>

<footer class="border-t border-hairline flex flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center lg:px-8">
  <a href="/" class="tag transition-colors hover:text-amber-text">← back</a>
  <p class="tag sm:ml-auto">mit · dawit</p>
</footer>
