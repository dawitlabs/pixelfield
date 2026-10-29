<script lang="ts">
  import { Github } from 'lucide-svelte';
  import { page } from '$app/state';

  const LINKS = [
    { href: '/', label: 'Overview' },
    { href: '/api/', label: 'Reference' },
  ];

  function isActive(href: string): boolean {
    return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith('/api');
  }
</script>

<div class="pointer-events-none sticky top-0 z-50 flex justify-center px-4 pt-4">
  <nav
    class="pointer-events-auto flex items-center gap-1 rounded-md border border-hairline bg-surface/85 py-1.5 pr-1.5 pl-3 shadow-[var(--shadow-float)] backdrop-blur-xl"
    aria-label="Main"
  >
    <a href="/" class="mr-2 flex items-center gap-2 text-[13.5px] font-semibold tracking-tight">
      <span class="grid h-4 w-4 grid-cols-2 grid-rows-2 gap-px" aria-hidden="true">
        <span class="bg-amber"></span>
        <span class="bg-amber-lift"></span>
        <span class="bg-raised"></span>
        <span class="bg-amber"></span>
      </span>
      pixelfield
    </a>
    {#each LINKS as link (link.href)}
      <a
        href={link.href}
        data-active={isActive(link.href)}
        aria-current={isActive(link.href) ? 'page' : undefined}
        class="rounded-sm px-2.5 py-1.5 text-[13px] text-muted transition-colors duration-200 hover:bg-raised hover:text-ice data-[active=true]:bg-raised data-[active=true]:text-ice"
      >
        {link.label}
      </a>
    {/each}
    <a
      href="https://github.com/dawitlabs/pixelfield"
      rel="noreferrer noopener"
      target="_blank"
      class="rounded-sm p-2 text-muted transition-colors duration-200 hover:bg-raised hover:text-ice"
      aria-label="pixelfield on GitHub"
    >
      <Github size={15} aria-hidden="true" />
    </a>
  </nav>
</div>
