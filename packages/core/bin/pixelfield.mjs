#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOCAL_REGISTRY = join(HERE, '..', 'registry');
const CONFIG_FILE = 'pixelfield.json';
const FRAMEWORKS = ['react', 'svelte', 'vanilla'];

const REMOTE_REGISTRY = 'https://pixel.dawit.dev/r';
const DEFAULT_CONFIG = { framework: 'react', outDir: 'src/components/pixelfield', registry: '' };

const c = {
  dim: (s) => `\u001b[2m${s}\u001b[0m`,
  bold: (s) => `\u001b[1m${s}\u001b[0m`,
  green: (s) => `\u001b[32m${s}\u001b[0m`,
  red: (s) => `\u001b[31m${s}\u001b[0m`,
  cyan: (s) => `\u001b[36m${s}\u001b[0m`,
};

function readConfig(cwd) {
  const path = join(cwd, CONFIG_FILE);
  if (!existsSync(path)) return null;
  return { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(path, 'utf8')) };
}

async function fetchItem(name, registry) {
  if (registry) {
    const response = await fetch(`${registry.replace(/\/$/, '')}/${name}.json`);
    if (!response.ok) throw new Error(`registry returned ${response.status} for "${name}"`);
    return response.json();
  }
  const path = join(LOCAL_REGISTRY, `${name}.json`);
  if (!existsSync(path)) throw new Error(`unknown effect "${name}"`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readIndex(registry) {
  if (registry) return null;
  return JSON.parse(readFileSync(join(LOCAL_REGISTRY, 'index.json'), 'utf8'));
}

function commandInit(cwd, args) {
  const framework = args.find((a) => FRAMEWORKS.includes(a)) ?? 'react';
  const path = join(cwd, CONFIG_FILE);
  if (existsSync(path) && !args.includes('--force')) {
    console.log(c.dim(`${CONFIG_FILE} already exists. Pass --force to overwrite.`));
    return 0;
  }
  const config = { ...DEFAULT_CONFIG, framework };
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`${c.green('created')} ${CONFIG_FILE} ${c.dim(`(${framework})`)}`);
  console.log(c.dim(`effects will be written to ${config.outDir}`));
  return 0;
}

function commandList(registry) {
  const index = readIndex(registry);
  if (!index) {
    console.log(c.dim('listing is only available against the bundled registry'));
    return 0;
  }
  const groups = new Map();
  for (const item of index.items) {
    if (!groups.has(item.generator)) groups.set(item.generator, []);
    groups.get(item.generator).push(item);
  }
  console.log(c.bold(`\n${index.count} effects\n`));
  for (const [generator, items] of groups) {
    console.log(c.cyan(generator));
    for (const item of items) {
      console.log(`  ${item.name.padEnd(10)} ${c.dim(item.description)}`);
    }
    console.log('');
  }
  return 0;
}

async function commandAdd(cwd, names, config) {
  if (!config) {
    console.log(c.red(`no ${CONFIG_FILE} found.`), c.dim('run `pixelfield init` first.'));
    return 1;
  }
  if (names.length === 0) {
    console.log(c.red('name at least one effect.'), c.dim('try `pixelfield list`.'));
    return 1;
  }

  const outDir = resolve(cwd, config.outDir);
  mkdirSync(outDir, { recursive: true });
  let written = 0;

  for (const name of names) {
    let item;
    try {
      item = await fetchItem(name, config.registry);
    } catch (error) {
      console.log(c.red('skipped'), name, c.dim(String(error.message)));
      continue;
    }
    const file = item.files.find((f) => f.framework === config.framework);
    if (!file) {
      console.log(c.red('skipped'), name, c.dim(`no ${config.framework} variant`));
      continue;
    }
    const target = join(outDir, file.target.split('/').pop());
    if (existsSync(target) && !names.includes('--overwrite')) {
      console.log(c.dim(`exists  ${target.replace(`${cwd}/`, '')}`));
      continue;
    }
    writeFileSync(target, file.content);
    console.log(`${c.green('added')}   ${target.replace(`${cwd}/`, '')}`);
    written += 1;
  }

  if (written > 0) {
    console.log(c.dim(`\ninstall the engine if you have not already:\n  pnpm add @dawitlabs/pixelfield`));
  }
  return 0;
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const cwd = process.cwd();
  const args = rest.filter((a) => !a.startsWith('--'));
  const config = readConfig(cwd);

  if (command === 'init') return commandInit(cwd, rest);
  if (command === 'list') return commandList(config?.registry ?? '');
  if (command === 'add') return commandAdd(cwd, args, config);

  console.log(`
${c.bold('pixelfield')} ${c.dim('— ordered-dither noise fields you own')}

  ${c.cyan('pixelfield init')} [react|svelte|vanilla]   create ${CONFIG_FILE}
  ${c.cyan('pixelfield list')}                          show every effect
  ${c.cyan('pixelfield add')} <name...>                 copy effects into your project

${c.dim('example:')}
  npx @dawitlabs/pixelfield init svelte
  npx @dawitlabs/pixelfield add ripple galaxy terrain
`);
  return command ? 1 : 0;
}

main().then((code) => process.exit(code ?? 0));
