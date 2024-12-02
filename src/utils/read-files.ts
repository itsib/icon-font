import { readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { IconFile } from '../types.js';
import { START_UNICODE } from './constants.js';

const testExpression = /(^|\/|\\)(?:((?:u[0-9a-f]{4,6},?)+)-)(.+)\.svg$/i;

function compareFiles(fileA: string, fileB: string): -1 | 0 | 1 {
  const hasUnicodeA = testExpression.test(fileA);
  const hasUnicodeB = testExpression.test(fileB);

  if (hasUnicodeA == hasUnicodeB) {
    // just compare alphabetically
    const fileA_ = fileA.slice(0, fileA.lastIndexOf('.'));
    const fileB_ = fileB.slice(0, fileB.lastIndexOf('.'));
    return fileA_ < fileB_ ? -1 : 1;
  } else {
    // map true to 0, because we want it to be first
    return ((hasUnicodeA ? 0 : 1) - (hasUnicodeB ? 0 : 1)) as -1 | 0 | 1;
  }
}

export async function readFiles(path: string, ext = 'svg'): Promise<IconFile[]> {
  const files = await readdir(path, { encoding: 'utf8' });
  let index = 0;

  files.sort(compareFiles);

  return files.reduce<IconFile[]>((acc, filename) => {
    if (filename.endsWith(`.${ext}`)) {
      const name = filename.replace(extname(filename), '');
      const id = `${name}${(0 === index ? '' : '-' + index)}`;
      const code = START_UNICODE + index;
      const unicode = `&#x${(code).toString(16).toUpperCase()};`;

      acc.push({
        id: id,
        name: name,
        code: code,
        unicode: unicode,
        path: join(path, filename),
      });

      index++;
    }

    return acc;
  }, []);
}