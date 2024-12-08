import { Buffer } from 'node:buffer';
import { SymbolMetadata } from '../../types/types.ts';
import { generateFontSvg } from '../font-svg/font-svg.ts';
import { AppConfig } from '../../types';
import { svg2ttf } from '../../svg-to-ttf'

export async function generateFontTtfBySvg(fontSvg: string) {
  const ttfFont = svg2ttf(fontSvg);

  return Buffer.from(ttfFont.buffer);
}

export async function generateFontTtf(config: Omit<AppConfig, 'output'>, files: SymbolMetadata[]): Promise<Buffer> {
  const fontSvg = await generateFontSvg(config, files);

  return generateFontTtfBySvg(fontSvg);
}