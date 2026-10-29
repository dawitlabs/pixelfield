<script lang="ts">
  import '../app.css';
  import Mark from '$lib/components/Mark.svelte';
  import Topbar from '$lib/components/Topbar.svelte';
  import { mode } from '$lib/mode.svelte';

  let { children } = $props();

  $effect(() => {
    mode.sync();
  });
</script>

<Topbar />
<div class="min-h-svh">
  {@render children()}
</div>

<footer class="mx-auto max-w-6xl px-5 pt-24 pb-14">
  <div class="flex flex-col gap-4 border-t border-hairline-soft pt-8 sm:flex-row sm:items-center">
    <Mark size={12} />
    <p class="mono-label">MIT · Dawit</p>
    <a
      href="https://github.com/dawitlabs/pixelfield"
      rel="noreferrer noopener"
      target="_blank"
      class="mono-label underline-offset-4 transition-colors hover:text-paper hover:underline sm:ml-auto"
    >
      github.com/dawitlabs/pixelfield
    </a>
  </div>
</footer>
