import ttf2eot from 'ttf2eot';
import { Buffer } from 'node:buffer';
import { generateFontTtf } from '../font-ttf/font-ttf.js';
import { AppConfig } from '../../types';

export async function generateFontEotByTtf(fontTtf: Buffer): Promise<Buffer> {
  return ttf2eot(fontTtf);
}

export async function generateFontEot(config: Omit<AppConfig, 'output'>): Promise<Buffer> {
  const fontTtf = await generateFontTtf(config);

  return await generateFontEotByTtf(fontTtf);
}