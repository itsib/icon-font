import { SymbolMetadata } from '../../types/types.ts';
import wawoff from 'wawoff2';
import { Buffer } from 'node:buffer';
import { generateFontTtf } from '../font-ttf/font-ttf.js';
import { AppConfig } from '../../types/app-config.ts';

export async function generateFontWoff2ByTtf(fontTtf: Buffer): Promise<Uint8Array> {
  return wawoff.compress(fontTtf);
}

export async function generateFontWoff2(config: Omit<AppConfig, 'output'>, files: SymbolMetadata[]): Promise<Uint8Array> {
  const fontTtf = await generateFontTtf(config, files);

  return await generateFontWoff2ByTtf(fontTtf);
}