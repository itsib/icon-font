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
import { slugify } from '../../utils/slugify.ts';
import { tableIdentifier } from '../../utils/string-to-bytes.ts';
import { TTFTable } from '../../types';
import { BufferByte } from '../../entities/buffer-byte.ts';
import { computeChecksum, unsignedLong } from '../../utils/compute-checksum.ts';

export class TransformToTTFFont extends Transform {

  private readonly _fontName: string;

  private readonly _metadata?: string;

  private _size: number = 0;

  private _isInitialized = false;

  private _glyphs: Glyph[] = [];

  private _glyphsByCode: { [codePoint: number]: Glyph } = {};

  private _glyphsTotalSize = 0;

  private static _TABLES: TTFTable[] = [
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

    this._size = Math.max(chunk.metadata.width, chunk.metadata.height);

    this._glyphs.push(new Glyph({
      id: 0,
      name: '',
      path: '',
      codepoint: 0,
      width: 0,
      height: this._size,
    }));
  }

  _transform(chunk: BufferWithMeta<SymbolMeta>, _encoding: BufferEncoding, callback: TransformCallback) {
    this._init(chunk);

    const glyph = new Glyph({
      id: this._glyphs.length,
      name: chunk.metadata.name,
      path: chunk.toString(),
      codepoint: chunk.metadata.codepoint,
      height: chunk.metadata.height,
      width: chunk.metadata.width,
    });

    this._glyphs.push(glyph);
    this._glyphsByCode[chunk.metadata.codepoint] = glyph;
    this._glyphsTotalSize += glyph.sizeBytes;

    callback(null, null);
  }

  _flush(callback: TransformCallback): void {
    const slug = slugify(this._fontName);

    const font = new Font({
      fontFamily: this._fontName,
      fontSubFamily: 'Regular',
      metadata: this._metadata,
      description: 'The best icon font in the world',
      url: 'https://github.com/itsib/icon-font',
      size: this._size,
      glyphTotalSize: this._glyphsTotalSize,
      glyphs: this._glyphs,
      codePoints: this._glyphsByCode,
    });

    const headerSize = 12 + (16 * TransformToTTFFont._TABLES.length);
    let bufSize = headerSize;

    TransformToTTFFont._TABLES.forEach(table => {
      table.buffer = table.create(font);
      table.length = table.buffer.length;
      table.corLength = table.length + (4 - table.length % 4) % 4;
      table.checkSum = computeChecksum(table.buffer);
      bufSize += table.corLength;
    });

    let offset = headerSize;

    TransformToTTFFont._TABLES.forEach(table => {
      table.offset = offset;
      offset += table.corLength!;
    });

    const buf = new BufferByte(bufSize);

    const entrySelector = Math.floor(Math.log(TransformToTTFFont._TABLES.length) / Math.LN2);
    const searchRange = Math.pow(2, entrySelector) * 16;
    const rangeShift = TransformToTTFFont._TABLES.length * 16 - searchRange;

    buf.writeUint32(TransformToTTFFont._VERSION);
    buf.writeUint16(TransformToTTFFont._TABLES.length);
    buf.writeUint16(searchRange);
    buf.writeUint16(entrySelector);
    buf.writeUint16(rangeShift);

    TransformToTTFFont._TABLES.forEach((table, index) => {
      buf.writeUint32(tableIdentifier(table.innerName));
      buf.writeUint32(table.checkSum!);
      buf.writeUint32(table.offset!);
      buf.writeUint32(table.length!);
    });

    let headOffset = 0;

    // const tables2 = TABLES.sort((a, b) => b.order - a.order);
    TransformToTTFFont._TABLES.forEach(table => {
      if (table.innerName === 'head') {
        headOffset = buf.tell();
      }
      buf.writeBytes(table.buffer!.buffer);
      for (let i = table.length!; i < table.corLength!; i++) {
        buf.writeUint8(0);
      }
    });


    buf.setUint32(headOffset + 8, unsignedLong(TransformToTTFFont._CHECKSUM_ADJUSTMENT - computeChecksum(buf)))

    callback(null, Buffer.from(buf.buffer));
  }
}