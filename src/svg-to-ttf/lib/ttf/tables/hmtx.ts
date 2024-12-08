import ByteBuffer from 'microbuffer';
import { Font, Glyph } from '../../sfnt.ts';

export default function createHtmxTable(font: Font): ByteBuffer {
  const buf = new ByteBuffer(font.glyphs.length * 4);

  font.glyphs.forEach((glyph: Glyph) => {
    buf.writeUint16(glyph.width); // advanceWidth
    buf.writeInt16(glyph.xMin); // lsb
  });

  return buf;
}
