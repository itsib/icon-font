import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { URL } from 'node:url'

const ROOT_PROJECT = resolve(dirname(new URL(import.meta.url).pathname), '..');

(async () => {
  const favicon = await readFile(join(ROOT_PROJECT, 'assets/favicon.svg'), 'utf8');
  const brand = await readFile(join(ROOT_PROJECT, 'assets/brand.svg'), 'utf8');
  let content = await readFile(join(ROOT_PROJECT, 'src/constants.ts'), 'utf8');

  const faviconSnipped = `export const FAVICON =\n\`${favicon.trim()}\`;`;
  const brandSnipped = `export const BRAND =\n\`${brand.trim()}\`;`;
  content = content.replace(/export\sconst\sFAVICON\s=\s?`\s?<svg[\w\s.=":\/><\-#@,(){}]+<\/svg>\s?`;/, faviconSnipped);
  content = content.replace(/export\sconst\sBRAND\s=\s?`\s?<svg[\w\s.=":\/><\-#@,(){}]+<\/svg>\s?`;/, brandSnipped);

  await writeFile(join(ROOT_PROJECT, 'src/constants.ts'), content, 'utf8');
})();