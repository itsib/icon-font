import { Buffer } from 'node:buffer';
import { AppConfig } from '../../types';
import { StreamRead } from '../../streams/stream-read/stream-read.ts';
import { TransformPrepareIcons } from '../../streams/transform-prepare-icons/transform-prepare-icons.ts';
import { Writable } from 'node:stream';
import { TransformToTTFFont } from '../../streams/transform-to-ttf-font/transform-to-ttf-font.ts';

export async function generateFontTtf(config: Omit<AppConfig, 'output'>): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const filesReadStream = new StreamRead(config.input);
    const prepareStream = new TransformPrepareIcons();
    const ttfFontStream = new TransformToTTFFont(config.name);

    let result: Buffer;
    const writeStream = new Writable({
      write(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
        result = chunk;
        callback();
      },
      final(callback: (error?: (Error | null)) => void) {
        resolve(result);
        callback();
      },
      destroy(error: Error | null, callback: (error?: (Error | null)) => void) {
        if (error) {
          reject(error);
        }
        callback(error);
      }
    });

    filesReadStream.pipe(prepareStream).pipe(ttfFontStream).pipe(writeStream);
  });
}
