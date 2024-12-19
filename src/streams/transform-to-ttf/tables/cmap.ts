import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';
import { Glyph } from '../../../entities/glyph.ts';

interface Segment {
  start: number;
  end: number;
  length?: number;
}

interface CodePoint {
  unicode: number;
  glyph: Glyph;
}

interface TableHeader {
  platformID: number;
  encodingID: number;
  table: BufferByte;
}

function getIDByUnicode(font: Font, unicode: number): number {
  return font.glyphsByCodePoints[unicode] ? font.glyphsByCodePoints[unicode].id : 0;
}

function getSegments(font: Font, bounds?: number): Segment[] {
  bounds = bounds || Number.MAX_VALUE;

  const result: Segment[] = [];
  let segment: Segment | undefined;

  font.codePoints.forEach(codePoint => {
    if (codePoint >= bounds) {
      return false;
    }
    if (!segment || codePoint !== (segment.end + 1)) {
      if (segment) {
        result.push(segment);
      }
      segment = {
        start: codePoint,
        end: codePoint
      };
    } else {
      segment.end = codePoint;
    }
  });

  if (segment) {
    result.push(segment);
  }

  result.forEach(segment => {
    segment.length = segment.end - segment.start + 1;
  });

  return result;
}

function getCodePoints(glyphsByCodePoints: Font['glyphsByCodePoints'], bounds?: number): CodePoint[] {
  bounds = bounds || Number.MAX_VALUE;

  const result: CodePoint[] = [];

  Object.entries(glyphsByCodePoints).forEach(([unicode, glyph]) => {
    const unicodeNum = parseInt(unicode, 10);
    if (unicodeNum > bounds) {
      return false;
    }
    result.push({
      unicode: unicodeNum,
      glyph: glyph
    });
  });
  return result;
}

function bufferForTable(format: number, length: number): BufferByte {
  const fieldWidth = format === 8 || format === 10 || format === 12 || format === 13 ? 4 : 2;

  length += (0
    + fieldWidth // Format
    + fieldWidth // Length
    + fieldWidth // Language
  );

  const LANGUAGE = 0;
  const buffer = new BufferByte(length);

  const writer = fieldWidth === 4 ? buffer.writeUint32 : buffer.writeUint16;

  buffer.writeUint16(format);
  if (fieldWidth === 4) {
    buffer.writeUint16(0);
  }
  writer.call(buffer, length);
  writer.call(buffer, LANGUAGE);

  return buffer;
}

function createFormat0Table(codePoints: { [key: number]: Glyph }): BufferByte {
  const length = 0xff + 1;
  const buffer = bufferForTable(0, length);

  for (let i = 0; i < length; i++) {
    buffer.writeUint8(codePoints[i]?.id || 0);
  }
  return buffer;
}

function createFormat4Table(font: Font): BufferByte {
  const FORMAT = 4;

  const segments = getSegments(font, 0xFFFF);
  const glyphIndexArrays: number[][] = [];

  segments.forEach(segment => {
    const glyphIndexArray: number[] = [];

    for (let unicode = segment.start; unicode <= segment.end; unicode++) {
      glyphIndexArray.push(getIDByUnicode(font, unicode));
    }
    glyphIndexArrays.push(glyphIndexArray);
  });

  const segCount = segments.length + 1;

  const glyphIndexArrayLength = glyphIndexArrays.reduce((acc, glyphIndex) => acc + glyphIndex.length, 0);

  /**
   * +2 segCountX2
   * +2 searchRange
   * +2 entrySelector
   * +2 rangeShift
   * +2 Padding
   */
  const length = (
    10
    + 2 * segCount // endCodes
    + 2 * segCount //startCodes
    + 2 * segCount //idDeltas
    + 2 * segCount //idRangeOffsets
    + 2 * glyphIndexArrayLength
  );

  const buffer = bufferForTable(FORMAT, length);

  buffer.writeUint16(segCount * 2);
  const maxExponent = Math.floor(Math.log(segCount) / Math.LN2);
  const searchRange = 2 * Math.pow(2, maxExponent);

  buffer.writeUint16(searchRange);
  buffer.writeUint16(maxExponent);
  buffer.writeUint16(2 * segCount - searchRange);

  segments.forEach(segment => {
    buffer.writeUint16(segment.end);
  });
  buffer.writeUint16(0xFFFF);

  buffer.writeUint16(0);

  segments.forEach(segment => {
    buffer.writeUint16(segment.start);
  });
  buffer.writeUint16(0xFFFF);

  for (let i = 0; i < segments.length; i++) {
    buffer.writeUint16(0);
  }
  buffer.writeUint16(1);

  let offset = 0;

  for (let i = 0; i < segments.length; i++) {
    buffer.writeUint16(2 * ((segments.length - i + 1) + offset));
    offset += glyphIndexArrays[i].length;
  }
  buffer.writeUint16(0);

  glyphIndexArrays.forEach(glyphIndexArray => {
    glyphIndexArray.forEach(glyphId => {
      buffer.writeUint16(glyphId);
    });
  });

  return buffer;
}

function createFormat12Table(font: Font): BufferByte {
  const FORMAT = 12;

  const codePoints = getCodePoints(font.glyphsByCodePoints);

  const length = (
    4 // nGroups
    + 4 * codePoints.length // startCharCode
    + 4 * codePoints.length // endCharCode
    + 4 * codePoints.length // startGlyphCode
  );

  const buffer = bufferForTable(FORMAT, length);

  buffer.writeUint32(codePoints.length);
  codePoints.forEach(codePoint => {
    buffer.writeUint32(codePoint.unicode);
    buffer.writeUint32(codePoint.unicode);
    buffer.writeUint32(codePoint.glyph.id);
  });

  return buffer;
}

export function createCMapTable(font: Font): BufferByte {
  /**
   * +2 platform
   * +2 encoding
   * +4 offset
   */
  const TABLE_HEAD = 8;

  const singleByteTable = createFormat0Table(font.glyphsByCodePoints);
  const twoByteTable = createFormat4Table(font);
  const fourByteTable = createFormat12Table(font);

  const tableHeaders: TableHeader[] = [
    {
      platformID: 0,
      encodingID: 3,
      table: twoByteTable
    },
    {
      platformID: 0,
      encodingID: 4,
      table: fourByteTable
    },
    {
      platformID: 1,
      encodingID: 0,
      table: singleByteTable
    },
    {
      platformID: 3,
      encodingID: 1,
      table: twoByteTable
    },
    {
      platformID: 3,
      encodingID: 10,
      table: fourByteTable
    }
  ];

  const tables = [
    twoByteTable,
    singleByteTable,
    fourByteTable
  ];

  /**
   * +2 version
   * +2 number of subtable headers
   */
  let tableOffset = 4 + tableHeaders.length * TABLE_HEAD;

  tables.forEach(table => {
    (table as any)._tableOffset = tableOffset;
    tableOffset += table.length;
  });

  const length = tableOffset;

  const buffer = new BufferByte(length);

  buffer.writeUint16(0);
  buffer.writeUint16(tableHeaders.length);

  tableHeaders.forEach(header => {
    buffer.writeUint16(header.platformID);
    buffer.writeUint16(header.encodingID);
    buffer.writeUint32((header.table as any)._tableOffset);
  });

  tables.forEach(table => {
    buffer.writeBytes(table.buffer);
  });

  return buffer;
}

