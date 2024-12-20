import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';

/**
 * Find max points in glyph TTF contours.
 * @param font
 */
function getMaxPoints(font: Font): number {
  return Math.max(...font.glyphs.map(glyph => {
    return glyph.contours.reduce((acc, ctr) => acc + ctr.points.length, 0);
  })) || 0;
}

function getMaxContours(font: Font): number {
  return Math.max(...font.glyphs.map(glyph => glyph.contours.length)) || 0;
}

export function createMaxpTable(font: Font): BufferByte {
  const buf = new BufferByte(32);

  buf.writeInt32(0x10000); // version
  buf.writeUint16(font.glyphs.length); // numGlyphs
  buf.writeUint16(getMaxPoints(font)); // maxPoints
  buf.writeUint16(getMaxContours(font)); // maxContours
  buf.writeUint16(0); // maxCompositePoints
  buf.writeUint16(0); // maxCompositeContours
  buf.writeUint16(2); // maxZones
  buf.writeUint16(0); // maxTwilightPoints
  // It is unclear how to calculate maxStorage, maxFunctionDefs and maxInstructionDefs.
  // These are magic constants now, with values exceeding values from FontForge
  buf.writeUint16(10); // maxStorage
  buf.writeUint16(10); // maxFunctionDefs
  buf.writeUint16(0); // maxInstructionDefs
  buf.writeUint16(255); // maxStackElements
  buf.writeUint16(0); // maxSizeOfInstructions
  buf.writeUint16(0); // maxComponentElements
  buf.writeUint16(0); // maxComponentDepth

  return buf;
}


