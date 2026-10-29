<script lang="ts">
  interface Props {
    size?: number;
  }

  let { size = 16 }: Props = $props();
</script>

<svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
  <rect x="0" y="4" width="4" height="4" fill="currentColor" />
  <rect x="4" y="0" width="4" height="4" fill="currentColor" />
  <rect x="8" y="4" width="4" height="4" fill="currentColor" />
  <rect x="4" y="8" width="4" height="4" fill="currentColor" />
</svg>
