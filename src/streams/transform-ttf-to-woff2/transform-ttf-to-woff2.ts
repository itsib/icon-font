import { Transform, TransformCallback } from 'node:stream';
import { Buffer } from 'node:buffer';
import wawoff from 'wawoff2';

export class TransformTtfToWoff2 extends Transform {

  private _buffer: Buffer | null = null;

  constructor() {
    super({ objectMode: true, autoDestroy: false });
  }

  _transform(chunk: Buffer, _: BufferEncoding, callback: TransformCallback) {
    if (this._buffer === null) {
      this._buffer = chunk;
    } else {
      this._buffer = Buffer.concat([this._buffer, chunk]);
    }
    callback(null);
  }

  _flush(callback: TransformCallback) {
    if (this._buffer) {
      wawoff.compress(this._buffer)
        .then(data => callback(null, Buffer.from(data)))
        .catch(err => callback(err));
    } else {
      const error = new Error('No result data');
      callback(error);
    }
  }
}