import { Transform, TransformCallback } from 'node:stream';
import { BufferWithMeta, SymbolMeta } from '../types/types.ts';


export class StreamTtfFontTransformer extends Transform {

  private readonly _fontName: string;

  private readonly _metadata?: string;

  private _isHeaderRendered = false;

  constructor(fontName: string, metadata?: string) {
    super({ objectMode: true });

    this._fontName = fontName;
    this._metadata = metadata;
  }

  _transform(chunk: BufferWithMeta<SymbolMeta>, _encoding: BufferEncoding, callback: TransformCallback) {

  }

  _flush(callback: TransformCallback) {

  }
}