import ttf2woff from 'ttf2woff';
import { Buffer } from 'node:buffer';
import { generateFontTtf } from '../font-ttf/font-ttf.js';
import { AppConfig } from '../../types';

export async function generateFontWoffByTtf(fontTtf: Buffer): Promise<Buffer> {
  return ttf2woff(fontTtf);
}

export async function generateFontWoff(config: Omit<AppConfig, 'output'>): Promise<Buffer> {
  const fontTtf = await generateFontTtf(config);

  return await generateFontWoffByTtf(fontTtf);
}