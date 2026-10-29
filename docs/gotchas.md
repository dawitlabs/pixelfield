# Gotchas

## Labels over a field need a solid chip

`mix-blend-difference` was used for tile labels and became unreadable the moment a preset
rendered bright. Every label sitting on a field now carries a `bg-void/80` chip. Check any
new overlay against the brightest preset (`static`, `plasma`), not the default.

## The install row must stack on mobile

A single non-wrapping flex row of tabs + command + copy overflowed 390px by 78px. The row
is now tabs-and-copy on one line with the command on its own scrollable line. Re-measure
`scrollWidth - clientWidth` after touching it.

## esbuild needs an allowBuilds entry

pnpm 10 does not run dependency lifecycle scripts, and Vite's esbuild binary comes from a
postinstall. `pnpm-workspace.yaml` carries `allowBuilds: { esbuild: true }`.

## The library is linked with file:

`@dawitlabs/pixelfield` resolves through `file:../pixelfield`. After changing the library,
rebuild it and re-run `pnpm install` here. `optimizeDeps.exclude` keeps Vite from
prebundling the raw `.svelte` entry.

## Site chrome is dark only, on purpose

The theme toggle was removed in the editorial rebuild. The chrome is near-monochrome so the
field supplies all the colour. Field palettes still ship light and dark; the `theme` option
is demonstrated on the reference page, not by recolouring the site.
