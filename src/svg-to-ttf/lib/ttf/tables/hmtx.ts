import { BufferSlim } from '../../../../utils/buffer-slim.ts';
import { Font, Glyph } from '../../sfnt.ts';

export default function createHtmxTable(font: Font): BufferSlim {
  const buf = new BufferSlim(font.glyphs.length * 4);

  font.glyphs.forEach((glyph: Glyph) => {
    buf.writeUint16(glyph.width); // advanceWidth
    buf.writeInt16(glyph.xMin); // lsb
  });

  return buf;
}
