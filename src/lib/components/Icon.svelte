<script lang="ts">
  import Iconify from '@iconify/svelte';

  interface Props {
    name: string;
    size?: number;
    class?: string;
  }

  let { name, size = 16, class: className = '' }: Props = $props();
</script>

<Iconify icon="pixelarticons:{name}" width={size} height={size} class={className} aria-hidden="true" />
