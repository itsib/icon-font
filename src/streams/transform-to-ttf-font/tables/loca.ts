import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';
import { Glyph } from '../../../entities/glyph.ts';

function tableSize(font: Font, isShortFormat: boolean): number {
  return (font.glyphs.length + 1) * (isShortFormat ? 2 : 4); // by glyph count + tail
}

export function createLocaTable(font: Font): BufferByte {
  const isShortFormat = font.ttf_glyph_size < 0x20000;

  const buf = new BufferByte(tableSize(font, isShortFormat));

  let location = 0;

  // Array of offsets in GLYF table for each glyph
  font.glyphs.forEach((glyph: Glyph) => {
    if (isShortFormat) {
      buf.writeUint16(location);
      location += glyph.sizeBytes / 2; // actual location must be divided to 2 in short format
    } else {
      buf.writeUint32(location);
      location += glyph.sizeBytes; // actual location is stored as is in long format
    }
  });

  // The last glyph location is stored to get last glyph length
  if (isShortFormat) {
    buf.writeUint16(location);
  } else {
    buf.writeUint32(location);
  }

  return buf;
}
