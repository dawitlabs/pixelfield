<script lang="ts">
  import { onMount } from 'svelte';
  import { mode } from '$lib/mode.svelte';

  let blobity: { updateOptions: (o: Record<string, unknown>) => void; destroy: () => void } | null =
    $state(null);

  onMount(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let instance: { destroy: () => void } | null = null;
    let cancelled = false;

    import('blobity').then(({ default: Blobity }) => {
      if (cancelled) return;
      const created = new Blobity({
        licenseKey: 'opensource',
        focusableElements: 'a, button, [role="tab"], input, [data-blobity]',
        focusableElementsOffsetX: 6,
        focusableElementsOffsetY: 6,
        color: '#ffffff',
        dotColor: '#ffffff',
        invert: true,
        radius: 0,
        magnetic: true,
        size: 12,
        dotSize: 0,
        zIndex: 200,
        opacity: 1,
        fontSize: 11,
        fontWeight: 500,
        mode: 'normal',
      });
      instance = created as unknown as { destroy: () => void };
      blobity = created as unknown as typeof blobity;
      document.documentElement.dataset.cursor = 'custom';
    });

    return () => {
      cancelled = true;
      instance?.destroy();
      document.documentElement.removeAttribute('data-cursor');
    };
  });

  $effect(() => {
    const colour = mode.current === 'day' ? '#000000' : '#ffffff';
    blobity?.updateOptions({ color: colour, dotColor: colour });
  });
</script>
