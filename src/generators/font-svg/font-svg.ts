import { Writable } from 'node:stream';
import { SymbolMetadata } from '../../types/types.ts';
import { StreamDirectoryReader } from '../../streams/stream-directory-reader.ts';
import { StreamPrepareTransformer } from '../../streams/stream-prepare-transformer.ts';
import { StreamSvgFontTransformer } from '../../streams/stream-svg-font-transformer.ts';
import { AppConfig } from '../../types/app-config.ts';

export async function generateFontSvg(config: Omit<AppConfig, 'output'>, _iconsInfo: SymbolMetadata[]): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const filesReadStream = new StreamDirectoryReader(config.input);
    const prepareStream = new StreamPrepareTransformer();
    const svgFontStream = new StreamSvgFontTransformer(config.name);

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
  })
}

