import { BufferSlim } from '../../utils/buffer-slim.ts';
import createGSUBTable from './ttf/tables/gsub.ts';
import createOS2Table from './ttf/tables/os2.ts';
import createCMapTable from './ttf/tables/cmap.ts';
import createGlyfTable from './ttf/tables/glyf.ts';
import createHeadTable from './ttf/tables/head.ts';
import createHHeadTable from './ttf/tables/hhea.ts';
import createHtmxTable from './ttf/tables/hmtx.ts';
import createLocaTable from './ttf/tables/loca.ts';
import createMaxpTable from './ttf/tables/maxp.ts';
import createNameTable from './ttf/tables/name.ts';
import createPostTable from './ttf/tables/post.ts';

import * as utils from './ttf/utils.ts';
import { Font } from './sfnt.ts';

interface Table {
  innerName: string;
  order: number;
  create: (font: Font) => BufferSlim;
  buffer?: BufferSlim;
  length?: number;
  corLength?: number;
  checkSum?: number;
  offset?: number;
}

// Tables
const TABLES: Array<Table> = [
  { innerName: 'GSUB', order: 4, create: createGSUBTable },
  { innerName: 'OS/2', order: 4, create: createOS2Table },
  { innerName: 'cmap', order: 6, create: createCMapTable },
  { innerName: 'glyf', order: 8, create: createGlyfTable },
  { innerName: 'head', order: 2, create: createHeadTable },
  { innerName: 'hhea', order: 1, create: createHHeadTable },
  { innerName: 'hmtx', order: 5, create: createHtmxTable },
  { innerName: 'loca', order: 7, create: createLocaTable },
  { innerName: 'maxp', order: 3, create: createMaxpTable },
  { innerName: 'name', order: 9, create: createNameTable },
  { innerName: 'post', order: 10, create: createPostTable }
];

// Various constants
const CONST = {
  VERSION: 0x10000,
  CHECKSUM_ADJUSTMENT: 0xB1B0AFBA
};

function ulong(t: number): number {
  t &= 0xffffffff;
  if (t < 0) {
    t += 0x100000000;
  }
  return t;
}

function calc_checksum(buf: BufferSlim): number {
  let sum = 0;
  const nlongs = Math.floor(buf.length / 4);

  for (let i = 0; i < nlongs; ++i) {
    const t = buf.getUint32(i * 4);
    sum = ulong(sum + t);
  }

  const leftBytes = buf.length - nlongs * 4;

  if (leftBytes > 0) {
    let leftRes = 0;

    for (let i = 0; i < 4; i++) {
      leftRes = (leftRes << 8) + ((i < leftBytes) ? buf.getUint8(nlongs * 4 + i) : 0);
    }
    sum = ulong(sum + leftRes);
  }
  return sum;
}

export function generateTTF(font: Font): BufferSlim {
  font.glyphs.forEach(glyph => {
    glyph.contours = utils.simplify(glyph.contours, 0.3);
    glyph.contours = utils.simplify(glyph.contours, 0.3);
    glyph.contours = utils.interpolate(glyph.contours, 1.1);
    glyph.contours = utils.roundPoints(glyph.contours);
    glyph.contours = utils.removeClosingReturnPoints(glyph.contours);
    glyph.contours = utils.toRelative(glyph.contours);
  });

  const headerSize = 12 + 16 * TABLES.length;
  let bufSize = headerSize;

  TABLES.forEach(table => {
    table.buffer = table.create(font);
    table.length = table.buffer.length;
    table.corLength = table.length + (4 - table.length % 4) % 4;
    table.checkSum = calc_checksum(table.buffer);
    bufSize += table.corLength;
  });

  let offset = headerSize;

  TABLES.forEach(table => {
    table.offset = offset;
    offset += table.corLength!;
  });

  const buf = new BufferSlim(bufSize);

  const entrySelector = Math.floor(Math.log(TABLES.length) / Math.LN2);
  const searchRange = Math.pow(2, entrySelector) * 16;
  const rangeShift = TABLES.length * 16 - searchRange;

  buf.writeUint32(CONST.VERSION);
  buf.writeUint16(TABLES.length);
  buf.writeUint16(searchRange);
  buf.writeUint16(entrySelector);
  buf.writeUint16(rangeShift);

  TABLES.forEach(table => {
    buf.writeUint32(utils.identifier(table.innerName));
    buf.writeUint32(table.checkSum!);
    buf.writeUint32(table.offset!);
    buf.writeUint32(table.length!);
  });

  let headOffset = 0;

  // const tables2 = TABLES.sort((a, b) => b.order - a.order);
  TABLES.forEach(table => {
    if (table.innerName === 'head') {
      headOffset = buf.tell();
    }
    buf.writeBytes(table.buffer!.buffer);
    for (let i = table.length!; i < table.corLength!; i++) {
      buf.writeUint8(0);
    }
  });

  buf.setUint32(headOffset + 8, ulong(CONST.CHECKSUM_ADJUSTMENT - calc_checksum(buf)));

  return buf;
}


