import { BufferSlim } from '../../../../utils/buffer-slim.ts';
import { Font, Glyph } from '../../sfnt.ts';

function tableSize(font: Font, isShortFormat: boolean): number {
  return (font.glyphs.length + 1) * (isShortFormat ? 2 : 4); // by glyph count + tail
}

export default function createLocaTable(font: Font): BufferSlim {
  const isShortFormat = font.ttf_glyph_size < 0x20000;

  const buf = new BufferSlim(tableSize(font, isShortFormat));

  let location = 0;

  // Array of offsets in GLYF table for each glyph
  font.glyphs.forEach((glyph: Glyph) => {
    if (isShortFormat) {
      buf.writeUint16(location);
      location += glyph.ttf_size / 2; // actual location must be divided to 2 in short format
    } else {
      buf.writeUint32(location);
      location += glyph.ttf_size; // actual location is stored as is in long format
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
