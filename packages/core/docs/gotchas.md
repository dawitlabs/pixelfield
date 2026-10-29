# Gotchas

## The palette assumes little-endian

`packPalette` writes `r | g << 8 | b << 16 | a << 24` into a `Uint32Array` aliased over
`ImageData.data`. On a big-endian machine the channels would be reversed. Every platform
this ships to is little-endian. If that ever stops being true, write the four bytes
through the `Uint8ClampedArray` view instead.

## Palette index 0 must stay fully transparent

The vertical ramp fades a cloud out by driving the quantised index toward 0. If index 0
is given a non-zero alpha, the fade turns into a hard band. Custom palettes passed through
`packPalette` must keep `[0, 0, 0, 0]` first.

## The canvas needs a CSS size before the first frame

`resize()` reads `getBoundingClientRect()`. A canvas with no CSS height renders a 1px
strip. The `ResizeObserver` recovers once a size arrives, but the first paint is wasted.

## `'use client'` must survive the build

`src/react.ts` opens with the directive and `tsc` preserves it in `dist/react.js`. Some
bundlers strip directive prologues when re-bundling a dependency. If the component starts
throwing hook errors in a server component tree, check that the directive is still the
first statement in the published file.

## Pointer tracking is on `window`, not the canvas

The canvas is typically `pointer-events: none` so it does not block clicks on content
layered above it. The glow therefore listens on `window` and hit-tests against the
canvas rect itself. Moving the listener onto the canvas silently kills the glow.

## Changing `seed` does not reset time

`update({ seed })` moves the noise offsets but leaves the accumulated `time` alone, so the
field jumps rather than restarting. That is intentional for theme toggles. Destroy and
recreate the instance for a true reset.

## The Svelte component must self-reference the package

`src/svelte/Field.svelte` imports from `@dawitlabs/pixelfield`, not from a relative path.
A relative `../index.js` resolves to `src/index.js`, which never exists: the source is
`.ts` and only `dist` and `src/svelte` are published. Node and Vite both resolve a
package self-reference through the `exports` map, so this is the only form that works
both inside this repo and inside a consumer's `node_modules`. Caught by building the
docs site against a `file:` link.

## The pointer glow is palette relative, not always brighter

The glow adds palette steps, it does not add light. On the dark ramp a higher index is a
lighter blue, so the cursor brightens the field. On the light ramp the top index is
`mix(base, black, 0.3)`, so the same +3 steps reads as the cloud *densifying* under the
cursor instead. Measured on the live playground: +199 mean on `theme: 'dark'`, -22 on
`theme: 'light'`. This matches the reference implementation and is not a bug, but do not
describe it as a glow in light-themed copy.

## Sourcemaps need the sources published

`dist/*.js.map` references `../src/*.ts`. Publishing only `dist` makes Vite warn
"Sourcemap points to missing source files" in every consumer. `files` therefore ships
`src` as well as `dist`.
