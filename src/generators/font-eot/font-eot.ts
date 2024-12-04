import { IconFile, IconFontConfig } from '../../types.js';
import ttf2eot from 'ttf2eot';
import { Buffer } from 'node:buffer';
import { generateFontTtf } from '../font-ttf/font-ttf.js';

export async function generateFontEotByTtf(fontTtf: Buffer): Promise<Buffer> {
  return ttf2eot(fontTtf);
}

export async function generateFontEot(config: Omit<IconFontConfig, 'output'>, files: IconFile[]): Promise<Buffer> {
  const fontTtf = await generateFontTtf(config, files);

  return await generateFontEotByTtf(fontTtf);
}