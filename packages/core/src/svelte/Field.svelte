<script lang="ts">
  import { untrack } from 'svelte';
  import { type FieldHandle, type FieldOptions, createField } from '@dawitlabs/pixelfield';

  interface Props extends FieldOptions {
    class?: string;
  }

  let { class: className = '', ...options }: Props = $props();

  let canvas: HTMLCanvasElement;
  let handle: FieldHandle | null = null;

  $effect(() => {
    const instance = createField(canvas, untrack(() => ({ ...options })));
    handle = instance;
    return () => {
      instance.destroy();
      handle = null;
    };
  });

  $effect(() => {
    handle?.update({ ...options });
  });
</script>

<canvas bind:this={canvas} class={className} aria-hidden="true"></canvas>

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
