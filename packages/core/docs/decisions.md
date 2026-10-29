# Decisions

## Reimplemented rather than wrapped

The algorithm was reconstructed from the shipped behaviour of a production site that
renders the same effect. No code was copied from a package; the published bundle
imported only React, next-themes and a `cn` helper, so there was no library to depend on.

## Core is framework agnostic

`createField(canvas, options)` owns all rendering, listeners and teardown. React and
Svelte bindings are thin: mount, forward prop changes through `update()`, destroy.
Adding a third binding should not touch `src/index.ts`.

## Noise tables are module-level and shared

`buildNoiseTable` costs ~330k interpolations per table. Both tables are built once on
the first `createField` call and reused by every instance on the page. A page with nine
clouds pays the cost once. The tradeoff is that the tables cannot be garbage collected
while the module is loaded, which is fine for their fixed 512 KB.

## Field runs at quarter resolution

The noise field is evaluated on a `(width/4 + 2) x (height/4 + 2)` grid and bilinearly
upsampled during compositing. Full-resolution noise was not measurably better and cost
16x more.

## 24 fps by default

The chunky palette hides low frame rates, and a third of the CPU cost is a real saving
when several instances run at once. `fps` is exposed if a caller disagrees.

## Public prop names are not boolean-prefixed

`interactive` and `playing` break the house `isX` convention deliberately. They are
component props following React and Svelte convention, where `isPlaying` as an attribute
reads wrong. Internal state does follow the convention: `isVisible`, `isLit`, `isOver`.

## `noUncheckedIndexedAccess` is off

The hot loops index typed arrays millions of times per second. Enabling the flag would
require non-null assertions on every access, which the house rules also ban. Bounds are
guaranteed by construction in `composite`, which never reads past `gridWidth * gridHeight`.

## Svelte component ships as source

`src/svelte/Field.svelte` is published unbuilt under the `svelte` export condition, which
is the standard contract. It avoids adding `svelte-package` and a second build step for
one file.

## Renamed from pixel-clouds, and why presets needed new knobs

The package was first built around the single effect it was reverse-engineered from and
called `pixel-clouds`. That was a scoping error: the renderer is a general dithered noise
field and clouds are one output of it. Renamed to `pixelfield`, `createCloud` to
`createField`, `direction` to `falloff`.

Presets alone would not have justified the rename. With only `tint`, `intensity` and
`falloff` to vary, eight presets would have been the same cloud recoloured. `scale`,
`aspect`, `warp`, `contrast`, `speed`, `flow` and `mode` were added so the presets differ
structurally. All are cheap: none of them rebuild a noise table.

## `waves` became `streaks`

The preset intended as water reads as horizontal interference once the field is squashed
to a third of its height. It was renamed to match what it actually produces rather than
shipping a preset whose name lies about its output.
