import { Writable } from 'node:stream';
import { createWriteStream } from 'node:fs';
import { Buffer } from 'node:buffer';

export class StreamWriteFile extends Writable {

  private _stream: Writable;
  private _onFinish?: () => void;

  constructor(output: string, onFinish?: () => void) {
    super({ objectMode: true });

    this._stream = createWriteStream(output);
    this._onFinish = onFinish;
  }

  _write(chunk: Buffer, _: BufferEncoding, callback: (error?: (Error | null)) => void) {
    this._stream.write(chunk, callback);
  }

  _final(callback: (error?: (Error | null)) => void) {
    this._stream.end(callback);

    this._onFinish?.();
  }

  _destroy(error: Error, callback: (error?: (Error | null)) => void) {
    this._stream.destroy(error);

    callback(error);
  }
}