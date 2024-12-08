import { BufferSlim } from '../../../../utils/buffer-slim.ts';
import { Font, Glyph } from '../../sfnt.ts';

function getFlags(glyph: Glyph): number[] {
  const result: number[] = [];

  for (let i = 0; i < glyph.contours.length; i++) {
    const contour = glyph.contours[i];

    for (let j = 0; j < contour.points.length; j++) {
      const point = contour.points[j];

      let flag = point.onCurve ? 1 : 0;

      if (point.x === 0) {
        flag += 16;
      } else {
        if (-0xFF <= point.x && point.x <= 0xFF) {
          flag += 2; // the corresponding x-coordinate is 1 byte long
        }
        if (point.x > 0 && point.x <= 0xFF) {
          flag += 16; // If x-Short Vector is set, this bit describes the sign of the value, with 1 equalling positive and 0 negative
        }
      }
      if (point.y === 0) {
        flag += 32;
      } else {
        if (-0xFF <= point.y && point.y <= 0xFF) {
          flag += 4; // the corresponding y-coordinate is 1 byte long
        }
        if (point.y > 0 && point.y <= 0xFF) {
          flag += 32; // If y-Short Vector is set, this bit describes the sign of the value, with 1 equalling positive and 0 negative.
        }
      }
      result.push(flag);
    }
  }

  return result;
}

/**
 * Repeating flags can be packed
 * @param flags
 */
function compactFlags(flags: number[]): number[] {
  const result: number[] = [];
  let prevFlag = -1;
  let firstRepeat = false;

  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    if (prevFlag === flag) {
      if (firstRepeat) {
        result[result.length - 1] += 8; // current flag repeats previous one, need to set 3rd bit of previous flag and set 1 to the current one
        result.push(1);
        firstRepeat = false;
      } else {
        result[result.length - 1]++; // when flag is repeating second or more times, we need to increase the last flag value
      }
    } else {
      firstRepeat = true;
      prevFlag = flag;
      result.push(flag);
    }
  }

  return result;
}

function getCoords(glyph: Glyph, coordName: 'x' | 'y'): number[] {
  const result: number[] = [];

  for (let i = 0; i < glyph.contours.length; i++) {
    const contour = glyph.contours[i];

    result.push(...contour.points.map(point => point[coordName]));
  }

  return result;
}

function compactCoords(coords: number[]): number[] {
  return coords.filter((coord: number) => coord !== 0);
}

/**
 * Calculates length of glyph data in GLYF table
 * @param glyph
 */
function glyphDataSize(glyph: Glyph): number {
  // Ignore glyphs without outlines. These will get a length of zero in the "loca" table
  if (!glyph.contours.length) {
    return 0;
  }

  let result = 12; // glyph fixed properties

  result += glyph.contours.length * 2; // add contours

  for (let i = 0; i < glyph.ttf_x.length; i++) {
    const x = glyph.ttf_x[i];
    // add 1 or 2 bytes for each coordinate depending of its size
    result += (-0xFF <= x && x <= 0xFF) ? 1 : 2;
  }

  for (let i = 0; i < glyph.ttf_y.length; i++) {
    const y = glyph.ttf_y[i];
    // add 1 or 2 bytes for each coordinate depending of its size
    result += (-0xFF <= y && y <= 0xFF) ? 1 : 2;
  }

  // Add flags length to glyph size.
  result += glyph.ttf_flags.length;

  if (result % 4 !== 0) { // glyph size must be divisible by 4.
    result += 4 - result % 4;
  }
  return result;
}

function tableSize(font: Font): number {
  let result = 0;

  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs[i];
    glyph.ttf_size = glyphDataSize(glyph);
    result += glyph.ttf_size;
  }

  font.ttf_glyph_size = result; // sum of all glyph lengths
  return result;
}

export default function createGlyfTable(font: Font): BufferSlim {
  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs[i];
    glyph.ttf_flags = getFlags(glyph);
    glyph.ttf_flags = compactFlags(glyph.ttf_flags);
    glyph.ttf_x = getCoords(glyph, 'x');
    glyph.ttf_x = compactCoords(glyph.ttf_x);
    glyph.ttf_y = getCoords(glyph, 'y');
    glyph.ttf_y = compactCoords(glyph.ttf_y);
  }

  const buf = new BufferSlim(tableSize(font));

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
    for (let j = 0; j < glyph.ttf_flags.length; j++) {
      buf.writeInt8(glyph.ttf_flags[j]);
    }

    // Array of X relative coordinates
    for (let j = 0; j < glyph.ttf_x.length; j++) {
      const x = glyph.ttf_x[j];
      if (-0xFF <= x && x <= 0xFF) {
        buf.writeUint8(Math.abs(x));
      } else {
        buf.writeInt16(x);
      }
    }

    // Array of Y relative coordinates
    for (let j = 0; j < glyph.ttf_y.length; j++) {
      const y = glyph.ttf_y[j];
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

