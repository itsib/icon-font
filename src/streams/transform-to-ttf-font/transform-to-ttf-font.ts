import { Transform, TransformCallback } from 'node:stream';
import { BufferWithMeta, SymbolMeta } from '../../types/types.ts';


export class TransformToTtfFont extends Transform {

  private readonly _fontName: string;

  private readonly _metadata?: string;

  private _isHeaderRendered = false;

  constructor(fontName: string, metadata?: string) {
    super({ objectMode: true });

    this._fontName = fontName;
    this._metadata = metadata;
  }

  private _header(symbolSize: number) {

  }

  _transform(chunk: BufferWithMeta<SymbolMeta>, _encoding: BufferEncoding, callback: TransformCallback) {
    if (!this._isHeaderRendered) {
      this._header(1);
      this._isHeaderRendered = true;
    }
  }

  _flush(callback: TransformCallback) {

  }
}