import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { URL } from 'node:url'

const ROOT_PROJECT = resolve(dirname(new URL(import.meta.url).pathname), '..');

async function readVersion() {
  const pkg = JSON.parse(await readFile(join(ROOT_PROJECT, 'package.json'), 'utf8'));
  return pkg.version;
}

async function readReadme() {
  return await readFile(join(ROOT_PROJECT, 'README.md'), 'utf8');
}

async function writeReadme(content) {
  await writeFile(join(ROOT_PROJECT, 'README.md'), content, 'utf8');
}

(async () => {
  const version = await readVersion();
  const readme = await readReadme();

  const patched = readme.replace(/version-\d+\.\d+\.\d+-blue\.svg/, `version-${version}-blue.svg`);

  await writeReadme(patched);

  console.log(`\x1b[0;92m✔ README.md version updated to ${version}\x1b[0m`);
})()