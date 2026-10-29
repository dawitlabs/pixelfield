<script lang="ts">
  import { page } from '$app/state';
  import Mark from '$lib/components/Mark.svelte';
  import { mode } from '$lib/mode.svelte';

  const LINKS = [
    { href: '/', label: 'Effects' },
    { href: '/api/', label: 'Reference' },
  ];

  function isActive(href: string): boolean {
    return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith('/api');
  }
</script>

<header class="sticky top-0 z-50 border-b border-hairline-soft bg-ink/85 backdrop-blur-xl">
  <div class="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
    <a href="/" class="flex items-center gap-2.5 text-[14px] font-600 tracking-tight">
      <Mark size={14} />
      pixelfield
    </a>
    <nav class="flex items-center gap-5" aria-label="Main">
      {#each LINKS as link (link.href)}
        <a
          href={link.href}
          data-active={isActive(link.href)}
          aria-current={isActive(link.href) ? 'page' : undefined}
          class="mono-label border-b border-transparent pb-0.5 transition-colors duration-200 hover:text-paper data-[active=true]:border-paper data-[active=true]:text-paper"
        >
          {link.label}
        </a>
      {/each}
    </nav>
    <div class="ml-auto flex items-center gap-5">
      <button
        type="button"
        onclick={() => mode.toggle()}
        class="flex items-center gap-2 rounded-pill border border-hairline px-3 py-1.5 transition-colors duration-200 hover:border-paper"
        aria-label="Switch to {mode.current === 'night' ? 'day' : 'night'} mode"
      >
        <span
          class="h-2.5 w-2.5 rounded-full border border-paper transition-all duration-300 ease-[var(--ease-spring)]"
          style={mode.current === 'day' ? 'background: var(--color-paper)' : 'background: transparent'}
        ></span>
        <span class="mono-label text-[11px]">{mode.current}</span>
      </button>
      <a
        href="https://github.com/dawitlabs/pixelfield"
        rel="noreferrer noopener"
        target="_blank"
        class="mono-label transition-colors duration-200 hover:text-paper"
      >
        GitHub ↗
      </a>
    </div>
  </div>
</header>
