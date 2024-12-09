import { Font } from '../entities/font.ts';
import { BufferByte } from '../entities/buffer-byte.ts';

export interface TTFTable {
  innerName: string;
  order: number;
  create: (font: Font) => BufferByte;
  buffer?: BufferByte;
  length?: number;
  corLength?: number;
  checkSum?: number;
  offset?: number;
}