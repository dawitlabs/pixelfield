export interface OptionSpec {
  name: string;
  type: string;
  fallback: string;
  summary: string;
}

export const OPTIONS: readonly OptionSpec[] = [
  {
    name: 'direction',
    type: "'up' | 'down' | 'fill'",
    fallback: "'down'",
    summary: 'Vertical density ramp. down fades toward the bottom, up toward the top, fill stays even.',
  },
  {
    name: 'seed',
    type: 'number',
    fallback: '0',
    summary: 'Offsets the noise field and the start time so sibling instances do not look identical.',
  },
  {
    name: 'intensity',
    type: 'number',
    fallback: '1',
    summary:
      'Multiplies the palette index before dithering. Above 1 the cloud saturates toward the top step.',
  },
  {
    name: 'interactive',
    type: 'boolean',
    fallback: 'true',
    summary: 'Adds a gaussian brightness bump that eases in under the pointer.',
  },
  {
    name: 'playing',
    type: 'boolean',
    fallback: 'true',
    summary: 'Stops the render loop when false. The last drawn frame stays on screen.',
  },
  {
    name: 'theme',
    type: "'light' | 'dark'",
    fallback: "'dark'",
    summary: 'Selects the built in palette. Ignored when tint is set.',
  },
  {
    name: 'tint',
    type: 'string',
    fallback: '—',
    summary: 'Hex colour. Derives a full seven step ramp around it, respecting the theme direction.',
  },
  {
    name: 'fps',
    type: 'number',
    fallback: '24',
    summary: 'Render cap. The loop still runs on rAF, frames past the cap are skipped.',
  },
];

export const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/playground', label: 'Playground' },
  { href: '/api', label: 'API' },
  { href: '/recipes', label: 'Recipes' },
  { href: '/internals', label: 'Internals' },
] as const;

export const PASTELS = [
  { name: 'lilac', hex: '#a99cf2' },
  { name: 'mint', hex: '#7fd7bb' },
  { name: 'peach', hex: '#f3a977' },
  { name: 'butter', hex: '#efc75e' },
  { name: 'sky', hex: '#7fb4ef' },
  { name: 'rose', hex: '#ef9aae' },
] as const;
