import { IconFile, IconFontConfig } from '../../types.js';
import ttf2woff from 'ttf2woff';
import { Buffer } from 'node:buffer';
import { generateFontTtf } from '../font-ttf/font-ttf.js';

export async function generateFontWoffByTtf(fontTtf: Buffer): Promise<Buffer> {
  return ttf2woff(fontTtf);
}

export async function generateFontWoff(config: Omit<IconFontConfig, 'output'>, files: IconFile[]): Promise<Buffer> {
  const fontTtf = await generateFontTtf(config, files);

  return await generateFontWoffByTtf(fontTtf);
}