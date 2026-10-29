<script lang="ts">
  import '../app.css';
  import Mark from '$lib/components/Mark.svelte';
  import Cursor from '$lib/components/Cursor.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import Topbar from '$lib/components/Topbar.svelte';
  import { mode } from '$lib/mode.svelte';
  import { onMount } from 'svelte';

  let { children } = $props();

  $effect(() => {
    mode.sync();
  });

  onMount(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    import('$lib/scrollbar').then(({ initScrollbar }) => {
      if (!cancelled) dispose = initScrollbar();
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  });
</script>

<Cursor />
<Topbar />
<div class="min-h-svh">
  {@render children()}
</div>

<footer class="mx-auto max-w-6xl px-5 pt-24 pb-14">
  <div class="dither-rule mb-8"></div>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
    <Mark size={12} />
    <p class="mono-label">MIT · Dawit</p>
    <a
      href="https://github.com/dawitlabs/pixelfield"
      rel="noreferrer noopener"
      target="_blank"
      data-blobity
      class="mono-label flex items-center gap-2 transition-colors hover:text-paper sm:ml-auto"
    >
      <Icon name="external-link" size={12} />
      github.com/dawitlabs/pixelfield
    </a>
  </div>
</footer>
