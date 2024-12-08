import { SymbolMetadata } from '../../types/types.ts';
import ttf2woff from 'ttf2woff';
import { Buffer } from 'node:buffer';
import { generateFontTtf } from '../font-ttf/font-ttf.js';
import { AppConfig } from '../../types/app-config.ts';

export async function generateFontWoffByTtf(fontTtf: Buffer): Promise<Buffer> {
  return ttf2woff(fontTtf);
}

export async function generateFontWoff(config: Omit<AppConfig, 'output'>, files: SymbolMetadata[]): Promise<Buffer> {
  const fontTtf = await generateFontTtf(config, files);

  return await generateFontWoffByTtf(fontTtf);
}