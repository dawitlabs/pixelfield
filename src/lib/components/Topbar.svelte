<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Icon from '$lib/components/Icon.svelte';
  import Mark from '$lib/components/Mark.svelte';
  import { mode } from '$lib/mode.svelte';

  const LINKS = [
    { href: '/', label: 'effects', icon: 'grid' },
    { href: '/create/', label: 'creator', icon: 'sliders' },
    { href: '/api/', label: 'reference', icon: 'book-open' },
  ];

  let header = $state<HTMLElement | null>(null);

  onMount(() => {
    if (!header) return;
    let instance: { destroy: () => void } | null = null;
    let cancelled = false;

    import('headroom.js').then(({ default: Headroom }) => {
      if (cancelled || !header) return;
      const created = new Headroom(header, {
        offset: 300,
        tolerance: { up: 6, down: 12 },
        classes: {
          initial: 'hdr',
          pinned: 'hdr-pinned',
          unpinned: 'hdr-unpinned',
          top: 'hdr-top',
          notTop: 'hdr-not-top',
        },
      });
      created.init();
      instance = created as unknown as { destroy: () => void };
    });

    return () => {
      cancelled = true;
      instance?.destroy();
    };
  });

  function isActive(href: string): boolean {
    return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
  }
</script>

<header bind:this={header} class="fixed inset-x-0 top-0 z-[90]">
  <div class="flex items-start justify-between p-4 sm:p-5">
    <a
      href="/"
      data-blobity
      class="flex items-center gap-2 px-2 py-1.5 text-[13px] font-600 tracking-tight"
      style="background: var(--color-ink); color: var(--color-paper)"
    >
      <Mark size={13} />
      pixelfield
    </a>

    <nav class="flex flex-col items-end" aria-label="Main">
      {#each LINKS as link (link.href)}
        <a
          href={link.href}
          data-blobity
          data-active={isActive(link.href)}
          aria-current={isActive(link.href) ? 'page' : undefined}
          class="flex items-center gap-1.5 px-2 py-1 font-mono text-[10.5px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-paper data-[active=true]:text-paper"
          style="background: var(--color-ink); color: var(--color-dim)"
        >
          <Icon name={link.icon} size={11} />
          {link.label}
        </a>
      {/each}
      <button
        type="button"
        data-blobity
        onclick={() => mode.toggle()}
        class="flex items-center gap-1.5 px-2 py-1 font-mono text-[10.5px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-paper"
        style="background: var(--color-ink); color: var(--color-dim)"
        aria-label="Switch to {mode.current === 'night' ? 'day' : 'night'} mode"
      >
        <Icon name={mode.current === 'night' ? 'moon' : 'sun'} size={11} />
        {mode.current}
      </button>
      <a
        href="https://github.com/dawitlabs/pixelfield"
        rel="noreferrer noopener"
        target="_blank"
        data-blobity
        class="flex items-center gap-1.5 px-2 py-1 font-mono text-[10.5px] tracking-[0.16em] uppercase transition-colors duration-200 hover:text-paper"
        style="background: var(--color-ink); color: var(--color-dim)"
      >
        <Icon name="github" size={11} />
        github
      </a>
    </nav>
  </div>
</header>

<style>
  header {
    transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }

  header:global(.hdr-unpinned) {
    transform: translateY(-110%);
  }

  header:global(.hdr-pinned) {
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    header {
      transition: none;
    }
    header:global(.hdr-unpinned) {
      transform: none;
    }
  }
</style>
