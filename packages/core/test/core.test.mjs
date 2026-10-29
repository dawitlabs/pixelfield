import assert from 'node:assert/strict';
import test from 'node:test';
import { GENERATOR_NAMES } from '../dist/generators.js';
import { buildNoiseTable, sample, shapeNoise } from '../dist/noise.js';
import { BAYER, packPalette, paletteFromTint } from '../dist/palette.js';
import { PRESET_NAMES, PRESETS, PRESETS_BY_GENERATOR } from '../dist/presets.js';

test('bayer matrix is a complete 8x8 permutation', () => {
  const values = BAYER.flatMap((row) => [...row].map((v) => Math.round(v * 64 - 0.5)));
  assert.equal(values.length, 64);
  assert.deepEqual(
    [...values].sort((a, b) => a - b),
    Array.from({ length: 64 }, (_, i) => i),
  );
});

test('noise table is deterministic and normalised', () => {
  const a = buildNoiseTable(1);
  assert.deepEqual([...a.slice(0, 64)], [...buildNoiseTable(1).slice(0, 64)]);
  assert.notDeepEqual([...a.slice(0, 64)], [...buildNoiseTable(2).slice(0, 64)]);
  for (const v of a) assert.ok(v >= 0 && v <= 1, `value ${v} out of range`);
});

test('sample wraps the table toroidally', () => {
  const table = buildNoiseTable(1);
  assert.equal(sample(table, -1, 0), sample(table, 255, 0));
  assert.equal(sample(table, 0, -1), sample(table, 0, 255));
  assert.equal(sample(table, 256, 256), sample(table, 0, 0));
});

test('noise modes stay in range and differ from fbm', () => {
  for (const v of [0, 0.17, 0.5, 0.83, 1]) {
    for (const mode of ['fbm', 'ridged', 'billow']) {
      const out = shapeNoise(v, mode);
      assert.ok(out >= 0 && out <= 1, `${mode}(${v}) = ${out}`);
    }
  }
  assert.equal(shapeNoise(0.5, 'ridged'), 1);
  assert.equal(shapeNoise(0.5, 'billow'), 0);
  assert.equal(shapeNoise(0.37, 'fbm'), 0.37);
});

test('palette packs little-endian rgba', () => {
  assert.equal(packPalette([[1, 2, 3, 4]])[0], (1 | (2 << 8) | (3 << 16) | (4 << 24)) >>> 0);
  assert.equal(packPalette([[0, 0, 0, 0]])[0], 0);
});

test('tint produces a 7 step ramp with a transparent floor', () => {
  for (const theme of ['light', 'dark']) {
    const ramp = paletteFromTint('#a99cf2', theme);
    assert.equal(ramp.length, 7);
    assert.equal(ramp[0], 0);
    for (let i = 1; i < ramp.length; i++) assert.equal(ramp[i] >>> 24, 255);
  }
});

test('tint rejects a non hex value', () => {
  assert.throws(() => paletteFromTint('rebeccapurple', 'dark'), /hex colour/);
});

test('every preset is complete and genuinely distinct', () => {
  const keys = [
    'generator',
    'falloff',
    'scale',
    'aspect',
    'warp',
    'contrast',
    'mode',
    'speed',
    'intensity',
    'flow',
  ];
  assert.ok(PRESET_NAMES.length >= 24, `only ${PRESET_NAMES.length} presets`);
  const seen = new Set();
  for (const name of PRESET_NAMES) {
    const preset = PRESETS[name];
    for (const key of keys) assert.ok(key in preset, `${name} missing ${key}`);
    assert.ok(preset.scale > 0, `${name} has non positive scale`);
    assert.ok(preset.contrast > 0, `${name} has non positive contrast`);
    assert.ok(preset.warp >= 0, `${name} has negative warp`);
    const signature = keys.map((k) => JSON.stringify(preset[k])).join('|');
    assert.ok(!seen.has(signature), `${name} duplicates another preset`);
    seen.add(signature);
  }
});

test('every generator family has presets and every preset names a real generator', () => {
  for (const generator of GENERATOR_NAMES) {
    assert.ok(PRESETS_BY_GENERATOR[generator]?.length > 0, `${generator} has no presets`);
  }
  for (const name of PRESET_NAMES) {
    assert.ok(GENERATOR_NAMES.includes(PRESETS[name].generator), `${name} names an unknown generator`);
  }
});
