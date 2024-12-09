import { Writable } from 'node:stream';
import { StreamRead } from '../../streams/stream-read/stream-read.ts';
import { TransformPrepareIcons } from '../../streams/transform-prepare-icons/transform-prepare-icons.ts';
import { TransformToSvgFont } from '../../streams/transform-to-svg-font/transform-to-svg-font.ts';
import { AppConfig } from '../../types';

export async function generateFontSvg(config: Omit<AppConfig, 'output'>): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const filesReadStream = new StreamRead(config.input);
    const prepareStream = new TransformPrepareIcons();
    const svgFontStream = new TransformToSvgFont(config.name);

    let result = '';
    const writeStream = new Writable({
      write(chunk: any, _encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
        result += chunk.toString();
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

    filesReadStream.pipe(prepareStream).pipe(svgFontStream).pipe(writeStream);
  });
}

