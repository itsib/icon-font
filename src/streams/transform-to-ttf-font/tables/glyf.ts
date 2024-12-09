import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';

export function createGlyfTable(font: Font): BufferByte {
  let tableSize = 0;
  for (let i = 0; i < font.glyphs.length; i++) {
    tableSize += font.glyphs[i].sizeBytes;
  }
  font.ttf_glyph_size = tableSize;

  const buf = new BufferByte(tableSize);

  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs[i];

    // Ignore glyphs without outlines. These will get a length of zero in the "loca" table
    if (!glyph.contours.length) {
      continue;
    }

    const offset = buf.tell();

    buf.writeInt16(glyph.contours.length); // numberOfContours
    buf.writeInt16(glyph.xMin); // xMin
    buf.writeInt16(glyph.yMin); // yMin
    buf.writeInt16(glyph.xMax); // xMax
    buf.writeInt16(glyph.yMax); // yMax

    // Array of end points
    let endPtsOfContours = -1;
    const contours = glyph.contours;
    for (let j = 0; j < contours.length; j++) {
      const contour = contours[j];

      endPtsOfContours += contour.points.length;
      buf.writeInt16(endPtsOfContours);
    }
    buf.writeInt16(0); // instructionLength, is not used here

    // Array of flags
    for (let j = 0; j < glyph.flags.length; j++) {
      buf.writeInt8(glyph.flags[j]);
    }

    // Array of X relative coordinates
    for (let j = 0; j < glyph.allX.length; j++) {
      const x = glyph.allX[j];
      if (-0xFF <= x && x <= 0xFF) {
        buf.writeUint8(Math.abs(x));
      } else {
        buf.writeInt16(x);
      }
    }

    // Array of Y relative coordinates
    for (let j = 0; j < glyph.allY.length; j++) {
      const y = glyph.allY[j];
      if (-0xFF <= y && y <= 0xFF) {
        buf.writeUint8(Math.abs(y));
      } else {
        buf.writeInt16(y);
      }
    }

    let tail = (buf.tell() - offset) % 4;

    if (tail !== 0) { // glyph size must be divisible by 4.
      for (; tail < 4; tail++) {
        buf.writeUint8(0);
      }
    }
  }

  return buf;
}

