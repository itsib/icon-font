import { BufferByte } from '../../../../entities/buffer-byte.ts';
import { Font } from '../../sfnt.ts';

export default function createHHeadTable(font: Font): BufferByte {
  const buf = new BufferByte(36); // fixed table length

  buf.writeInt32(0x10000); // version
  buf.writeInt16(font.ascent); // ascent
  buf.writeInt16(font.descent); // descend
  // Non zero lineGap causes offset in IE, https://github.com/fontello/svg2ttf/issues/37
  buf.writeInt16(0); // lineGap
  buf.writeUint16(font.maxWidth); // advanceWidthMax
  buf.writeInt16(font.minLsb); // minLeftSideBearing
  buf.writeInt16(font.minRsb); // minRightSideBearing
  buf.writeInt16(font.maxExtent); // xMaxExtent
  buf.writeInt16(1); // caretSlopeRise
  buf.writeInt16(0); // caretSlopeRun
  buf.writeUint32(0); // reserved1
  buf.writeUint32(0); // reserved2
  buf.writeUint16(0); // reserved3
  buf.writeInt16(0); // metricDataFormat
  buf.writeUint16(font.glyphs.length); // numberOfHMetrics

  return buf;
}