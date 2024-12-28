import { FontType } from '../types';
import { join } from 'node:path';
import { slugify } from './slugify.ts';

export function fontFaceUrl(base: string, fontId: string, type: FontType, hash?: string): string {
  let fontUrl = join(base, `${fontId}.${type}`);
  if (hash) {
    fontUrl += `?hash=${hash}`;
  }

  switch (type) {
    case 'eot':
      return `url("${fontUrl}#iefix") format("embedded-opentype")`;
    case 'woff2':
      return `url("${fontUrl}") format("woff2")`;
    case 'woff':
      return `url("${fontUrl}") format("woff")`;
    case 'ttf':
      return `url("${fontUrl}") format("truetype")`;
    case 'svg':
      return `url("${fontUrl}") format("svg")`;
    default:
      throw new Error(`Unsupported type "${type}"`);
  }
}

export function fontFace(base: string, fontName: string, types: FontType[], hash?: string): string {
  const fontId = slugify(fontName);
  let output = '@font-face {\n'
  output += '  font-display: auto;\n';
  output += `  font-family: "${fontName}";\n`;
  output += '  src: ';

  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const fontUrl = fontFaceUrl(base, fontId, type, hash);
    output += i === 0 ? fontUrl : `     ${fontUrl}`;
    output += i === types.length - 1 ? ';\n' : ',\n';
  }
  output += '}\n';
  return output;
}