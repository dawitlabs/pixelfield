# @dawitlabs/pixelfield

Animated ordered-dither noise fields, rendered straight into a canvas `ImageData` buffer.
Zero runtime dependencies. Vanilla core plus React and Svelte bindings.

Clouds are one preset of eight. The renderer is a general dithered noise field.

## Install

```sh
pnpm add @dawitlabs/pixelfield
```

## Use

```js
import { createField } from '@dawitlabs/pixelfield';

const field = createField(document.querySelector('canvas'), { preset: 'terrain' });
field.update({ warp: 2.2 });
field.destroy();
```

```tsx
import { Field } from '@dawitlabs/pixelfield/react';

<Field className="absolute inset-0 -z-10" preset="smoke" tint="#d9e86a" />;
```

```svelte
<script>
  import Field from '@dawitlabs/pixelfield/svelte';
</script>

<Field preset="plasma" />
```

The canvas takes its size from CSS; the renderer sets the backing store itself.

## Presets

| preset | what it looks like |
| --- | --- |
| `clouds` | Soft fbm, full warp, density at the top edge |
| `fog` | Low frequency, half warp, wide tonal window |
| `streaks` | Billow noise squashed and pushed sideways. Interference, not water |
| `terrain` | Ridged noise at high contrast. Sharp veins |
| `plasma` | Warp and time both at 2.4. The domain eats itself |
| `smoke` | Stretched vertically, drifting up, soft window |
| `nebula` | Ridged at low frequency, tight window. Structure without edges |
| `static` | No warp, frequency past the pixel grid |

A preset is a bundle of the options below. Anything passed alongside one wins.

## Options

| option | type | default |
| --- | --- | --- |
| `preset` | `FieldPreset` | `'clouds'` |
| `falloff` | `'up' \| 'down' \| 'fill'` | `'down'` |
| `mode` | `'fbm' \| 'ridged' \| 'billow'` | `'fbm'` |
| `scale` | `number` | `1` |
| `aspect` | `number` | `1` |
| `warp` | `number` | `1` |
| `contrast` | `number` | `1` |
| `speed` | `number` | `1` |
| `flow` | `{ x, y }` | `{ x: 0, y: 0 }` |
| `seed` | `number` | `0` |
| `intensity` | `number` | `1` |
| `theme` | `'light' \| 'dark'` | `'dark'` |
| `tint` | `string` | — |
| `palette` | `Uint32Array` | — |
| `interactive` | `boolean` | `true` |
| `playing` | `boolean` | `true` |
| `fps` | `number` | `24` |

## How it works

1. Backing store downscaled by `max(2, ceil(width / 760))`. That is the pixel look.
2. Two 256×256 value-noise tables, five octaves at gain 0.55, built once per page and shared.
3. Three chained lookups domain-warp each other.
4. An 8×8 Bayer matrix added per pixel before quantising. That is the grain.
5. Values quantise into a seven entry `Uint32Array` palette. That is the banding.

The field is evaluated at quarter resolution and bilinearly upsampled, so the expensive
part touches one sixteenth of the pixels. Capped at 24fps.

## Accessibility and cost

- `prefers-reduced-motion: reduce` renders one static frame and never starts the loop, and
  reacts to the preference changing at runtime.
- The loop pauses on `visibilitychange`.
- Both bindings mark the canvas `aria-hidden="true"`.

## License

MIT
