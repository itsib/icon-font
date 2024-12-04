import svg2ttf from 'svg2ttf';
import { Buffer } from 'node:buffer';
import { IconFile, IconFontConfig } from '../../types.js';
import { generateFontSvg } from '../font-svg/font-svg.js';

export async function generateFontTtfBySvg(fontSvg: string) {
  const ttf = svg2ttf(fontSvg, {});

  return Buffer.from(ttf.buffer);
}

export async function generateFontTtf(config: Omit<IconFontConfig, 'output'>, files: IconFile[]): Promise<Buffer> {
  const fontSvg = await generateFontSvg(config, files);

  return generateFontTtfBySvg(fontSvg);
}