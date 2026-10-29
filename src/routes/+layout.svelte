<script lang="ts">
  import '../app.css';
  import Topbar from '$lib/components/Topbar.svelte';

  let { children } = $props();
</script>

<Topbar />
<div class="min-h-svh">
  {@render children()}
</div>

<footer class="mx-auto max-w-6xl px-5 pt-20 pb-12">
  <div class="flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center">
    <p class="tag">mit · built by dawit</p>
    <a
      href="https://github.com/dawitlabs/pixelfield"
      rel="noreferrer noopener"
      target="_blank"
      class="tag transition-colors duration-200 hover:text-amber-text sm:ml-auto"
    >
      github.com/dawitlabs/pixelfield
    </a>
  </div>
</footer>
