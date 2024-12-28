import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';

export function createHtmxTable(font: Font): BufferByte {
  const buffer = new BufferByte(font.glyphs.length * 4);

  for (let i = 0; i < font.glyphs.length; i++) {
    buffer.writeUint16(font.glyphs[i].width); // advanceWidth
    buffer.writeInt16(font.glyphs[i].xMin); // lsb
  }

  return buffer;
}
