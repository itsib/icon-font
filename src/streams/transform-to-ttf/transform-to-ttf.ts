import { Transform, TransformCallback } from 'node:stream';
import { Buffer } from 'node:buffer';
import { BufferWithMeta, SymbolMeta } from '../../types/types.ts';
import { Glyph } from '../../entities/glyph.ts';
import { Font } from '../../entities/font.ts';
import { createPostTable } from './tables/post.ts';
import { createNameTable } from './tables/name.ts';
import { createGlyfTable } from './tables/glyf.ts';
import { createLocaTable } from './tables/loca.ts';
import { createCMapTable } from './tables/cmap.ts';
import { createHtmxTable } from './tables/hmtx.ts';
import { createGSUBTable } from './tables/gsub.ts';
import { createOS2Table } from './tables/os2.ts';
import { createMaxpTable } from './tables/maxp.ts';
import { createHeadTable } from './tables/head.ts';
import { createHHeadTable } from './tables/hhea.ts';
import { tableIdentifier } from '../../utils/string-to-bytes.ts';
import { TTFTable } from '../../types';
import { BufferByte } from '../../entities/buffer-byte.ts';
import { computeChecksum, unsignedLong } from '../../utils/compute-checksum.ts';

export class TransformToTtf extends Transform {

  private readonly _fontName: string;

  private readonly _metadata?: string;

  private _unitsPerEm: number = 0;

  private _isInitialized = false;

  private _glyphs: Glyph[] = [];

  private _glyphsByCode: { [codePoint: number]: Glyph } = {};

  private _glyphsTotalSize = 0;

  private static _TABLES: TTFTable[] = [
    { innerName: 'GSUB', order: 4, create: createGSUBTable },   // Glyph substitution data
    { innerName: 'OS/2', order: 4, create: createOS2Table },    // OS/2 and Windows specific metrics
    { innerName: 'cmap', order: 6, create: createCMapTable },   // Character to glyph mapping
    { innerName: 'glyf', order: 8, create: createGlyfTable },   // Glyph data
    { innerName: 'head', order: 2, create: createHeadTable },   // Font Head
    { innerName: 'hhea', order: 1, create: createHHeadTable },  // Horizontal header
    { innerName: 'hmtx', order: 5, create: createHtmxTable },   // Horizontal metrics
    { innerName: 'loca', order: 7, create: createLocaTable },   // Index to location
    { innerName: 'maxp', order: 3, create: createMaxpTable },   // Maximum profile
    { innerName: 'name', order: 9, create: createNameTable },   // Naming table
    { innerName: 'post', order: 10, create: createPostTable },  // 	PostScript information
  ];

  private static _VERSION = 0x10000;

  private static _CHECKSUM_ADJUSTMENT = 0xB1B0AFBA;

  constructor(fontName: string, metadata?: string) {
    super({ objectMode: true });

    this._fontName = fontName;
    this._metadata = metadata;
  }

  _init(chunk: BufferWithMeta<SymbolMeta>) {
    if (this._isInitialized) return;
    this._isInitialized = true;

    this._unitsPerEm = chunk.metadata.unitsPerEm;

    this._glyphs.push(new Glyph({
      id: 0,
      name: '',
      path: '',
      codepoint: 0,
      x: 0,
      y: 0,
      width: 0,
      height: this._unitsPerEm,
    }));
  }

  _transform(chunk: BufferWithMeta<SymbolMeta>, _encoding: BufferEncoding, callback: TransformCallback) {
    this._init(chunk);

    const glyph = new Glyph({
      id: this._glyphs.length,
      name: chunk.metadata.name,
      path: chunk.toString(),
      codepoint: chunk.metadata.codepoint,
      x: chunk.metadata.x,
      y: chunk.metadata.y,
      height: chunk.metadata.height,
      width: chunk.metadata.width,
    });

    this._glyphs.push(glyph);
    this._glyphsByCode[chunk.metadata.codepoint] = glyph;
    this._glyphsTotalSize += glyph.sizeBytes;

    callback(null, null);
  }

  _flush(callback: TransformCallback): void {
    const font = new Font({
      fontFamily: this._fontName,
      fontSubFamily: 'Regular',
      metadata: this._metadata,
      description: 'The best icon font in the world',
      url: 'https://github.com/itsib/icon-font',
      unitsPerEm: this._unitsPerEm,
      glyphTotalSize: this._glyphsTotalSize,
      glyphs: this._glyphs,
      codePoints: this._glyphsByCode,
    });

    const headerSize = 12 + (16 * TransformToTtf._TABLES.length);
    let bufSize = headerSize;

    TransformToTtf._TABLES.forEach(table => {
      table.buffer = table.create(font);
      table.length = table.buffer.length;
      table.corLength = table.length + (4 - table.length % 4) % 4;
      table.checkSum = computeChecksum(table.buffer);
      bufSize += table.corLength;
    });

    let offset = headerSize;

    TransformToTtf._TABLES.forEach(table => {
      table.offset = offset;
      offset += table.corLength!;
    });

    const buffer = new BufferByte(bufSize);

    const entrySelector = Math.floor(Math.log(TransformToTtf._TABLES.length) / Math.LN2);
    const searchRange = Math.pow(2, entrySelector) * 16;
    const rangeShift = TransformToTtf._TABLES.length * 16 - searchRange;

    buffer.writeUint32(TransformToTtf._VERSION);
    buffer.writeUint16(TransformToTtf._TABLES.length);
    buffer.writeUint16(searchRange);
    buffer.writeUint16(entrySelector);
    buffer.writeUint16(rangeShift);

    TransformToTtf._TABLES.forEach((table, index) => {
      buffer.writeUint32(tableIdentifier(table.innerName));
      buffer.writeUint32(table.checkSum!);
      buffer.writeUint32(table.offset!);
      buffer.writeUint32(table.length!);
    });

    let headOffset = 0;

    // const tables2 = TABLES.sort((a, b) => b.order - a.order);
    TransformToTtf._TABLES.forEach(table => {
      if (table.innerName === 'head') {
        headOffset = buffer.tell();
      }
      buffer.writeBytes(table.buffer!.buffer);
      for (let i = table.length!; i < table.corLength!; i++) {
        buffer.writeUint8(0);
      }
    });


    buffer.setUint32(headOffset + 8, unsignedLong(TransformToTtf._CHECKSUM_ADJUSTMENT - computeChecksum(buffer)))

    callback(null, Buffer.from(buffer.buffer));
  }
}