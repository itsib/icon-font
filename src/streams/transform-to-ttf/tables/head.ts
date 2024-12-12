import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';
import { dateToUInt64 } from '../../../utils/string-to-bytes.ts';

export function createHeadTable(font: Font): BufferByte {
  const buffer = new BufferByte(54); // fixed table length
  const created = new Date();

  const { xMin, xMax, yMax, yMin } = font.getBounds();

  buffer.writeInt32(0x10000); // version
  buffer.writeInt32(0x10000); // fontRevision - 1
  buffer.writeUint32(0); // checkSumAdjustment
  buffer.writeUint32(0x5F0F3CF5); // magicNumber
  // FLag meanings:
  // Bit 0: Baseline for font at y=0;
  // Bit 1: Left sidebearing point at x=0;
  // Bit 3: Force ppem to integer values for all internal scaler math; may use fractional ppem sizes if this bit is clear;
  buffer.writeUint16(0x000B); // flags
  buffer.writeUint16(font.unitsPerEm); // unitsPerEm
  buffer.writeUint64(dateToUInt64(created)); // created
  buffer.writeUint64(dateToUInt64(created)); // modified
  buffer.writeInt16(xMin); // xMin
  buffer.writeInt16(yMin); // yMin
  buffer.writeInt16(xMax); // xMax
  buffer.writeInt16(yMax); // yMax
  buffer.writeUint16(0); //macStyle
  buffer.writeUint16(8); // lowestRecPPEM
  buffer.writeInt16(2); // fontDirectionHint
  buffer.writeInt16(font.glyphTotalSize < 0x20000 ? 0 : 1); // indexToLocFormat, 0 for short offsets, 1 for long offsets
  buffer.writeInt16(0); // glyphDataFormat

  return buffer;
}

