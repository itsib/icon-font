import { Transform, TransformCallback } from 'node:stream';
import { Buffer } from 'node:buffer';
import ttf2eot from 'ttf2eot';

export class TransformTtfToEot extends Transform {

  private _buffer: Buffer | null = null;

  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk: Buffer, _: BufferEncoding, callback: TransformCallback) {
    if (this._buffer === null) {
      this._buffer = chunk;
    } else {
      this._buffer = Buffer.concat([this._buffer, chunk]);
    }
    callback();
  }

  _flush(callback: TransformCallback) {
    if (this._buffer) {
      callback(null,  ttf2eot(this._buffer));
    } else {
      const error = new Error('No result data');
      callback(error);
    }
  }
}