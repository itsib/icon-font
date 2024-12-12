import { Writable } from 'node:stream';
import { Buffer } from 'node:buffer';

export class StreamWritePromise extends Writable {

  private _buffer: Buffer | null = null;

  private _promise: Promise<Buffer>;
  private _resolve: () => void;
  private _reject: (error: any) => void;

  constructor() {
    super({ objectMode: true });

    let _resolve: any;
    let _reject: any;
    this._promise = new Promise<Buffer>((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    })

    this._resolve = () => _resolve(this._buffer);
    this._reject = () => _reject(this._buffer);
  }

  _write(chunk: Buffer, _: BufferEncoding, callback: (error?: (Error | null)) => void) {
    if (this._buffer === null) {
      this._buffer = chunk;
    } else {
      this._buffer = Buffer.concat([this._buffer, chunk]);
    }
    callback();
  }

  _final(callback: (error?: (Error | null)) => void) {
    if (this._buffer) {
      this._resolve();
      callback();
    } else {
      const error = new Error('No result data');
      this._reject(error);
      callback(error);
    }
  }

  _destroy(error: Error | null, callback: (error?: (Error | null)) => void) {
    this._reject(error);
    callback(error);
  }

  toPromise(): Promise<Buffer> {
    return this._promise;
  }
}