import { IconFile, IconFontConfig } from '../../types.js';
import wawoff from 'wawoff2';
import { Buffer } from 'node:buffer';
import { generateFontTtf } from '../font-ttf/font-ttf.js';

export async function generateFontWoff2ByTtf(fontTtf: Buffer): Promise<Uint8Array> {
  return wawoff.compress(fontTtf);
}

export async function generateFontWoff2(config: Required<IconFontConfig>, files: IconFile[]): Promise<Uint8Array> {
  const fontTtf = await generateFontTtf(config, files);

  return await generateFontWoff2ByTtf(fontTtf);
}