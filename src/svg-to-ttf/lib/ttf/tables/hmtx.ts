import { BufferByte } from '../../../../entities/buffer-byte.ts';
import { Font, Glyph } from '../../sfnt.ts';

export default function createHtmxTable(font: Font): BufferByte {
  const buf = new BufferByte(font.glyphs.length * 4);

  font.glyphs.forEach((glyph: Glyph) => {
    buf.writeUint16(glyph.width); // advanceWidth
    buf.writeInt16(glyph.xMin); // lsb
  });

  return buf;
}
