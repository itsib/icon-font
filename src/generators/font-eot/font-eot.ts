import { SymbolMetadata } from '../../types/types.ts';
import ttf2eot from 'ttf2eot';
import { Buffer } from 'node:buffer';
import { generateFontTtf } from '../font-ttf/font-ttf.js';
import { AppConfig } from '../../types/app-config.ts';

export async function generateFontEotByTtf(fontTtf: Buffer): Promise<Buffer> {
  return ttf2eot(fontTtf);
}

export async function generateFontEot(config: Omit<AppConfig, 'output'>, files: SymbolMetadata[]): Promise<Buffer> {
  const fontTtf = await generateFontTtf(config, files);

  return await generateFontEotByTtf(fontTtf);
}