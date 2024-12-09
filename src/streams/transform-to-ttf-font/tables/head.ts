import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';
import { dateToUInt64 } from '../../../utils/string-to-bytes.ts';

export function createHeadTable(font: Font): BufferByte {
  const buf = new BufferByte(54); // fixed table length

  buf.writeInt32(0x10000); // version
  buf.writeInt32(font.revision * 0x10000); // fontRevision
  buf.writeUint32(0); // checkSumAdjustment
  buf.writeUint32(0x5F0F3CF5); // magicNumber
  // FLag meanings:
  // Bit 0: Baseline for font at y=0;
  // Bit 1: Left sidebearing point at x=0;
  // Bit 3: Force ppem to integer values for all internal scaler math; may use fractional ppem sizes if this bit is clear;
  buf.writeUint16(0x000B); // flags
  buf.writeUint16(font.unitsPerEm); // unitsPerEm
  buf.writeUint64(dateToUInt64(font.createdDate)); // created
  buf.writeUint64(dateToUInt64(font.modifiedDate)); // modified
  buf.writeInt16(font.xMin); // xMin
  buf.writeInt16(font.yMin); // yMin
  buf.writeInt16(font.xMax); // xMax
  buf.writeInt16(font.yMax); // yMax
  buf.writeUint16(font.macStyle); //macStyle
  buf.writeUint16(font.lowestRecPPEM); // lowestRecPPEM
  buf.writeInt16(2); // fontDirectionHint
  buf.writeInt16(font.ttf_glyph_size < 0x20000 ? 0 : 1); // indexToLocFormat, 0 for short offsets, 1 for long offsets
  buf.writeInt16(0); // glyphDataFormat

  return buf;
}

