import { Buffer } from 'node:buffer';
import { SymbolMetadata } from '../../types/types.ts';
import { generateFontSvg } from '../font-svg/font-svg.ts';
import { AppConfig } from '../../types';
import { svg2ttf } from '../../svg-to-ttf'
import { StreamRead } from '../../streams/stream-read/stream-read.ts';
import { TransformPrepareIcons } from '../../streams/transform-prepare-icons/transform-prepare-icons.ts';
import { Writable } from 'node:stream';
import { TransformToTTFFont } from '../../streams/transform-to-ttf-font/transform-to-ttf-font.ts';

export async function generateFontTtfBySvg(fontSvg: string) {
  const ttfFont = svg2ttf(fontSvg);

  return Buffer.from(ttfFont.buffer);
}

export async function _generateFontTtf(config: Omit<AppConfig, 'output'>, files: SymbolMetadata[]): Promise<Buffer> {
  const fontSvg = await generateFontSvg(config, files);

  return generateFontTtfBySvg(fontSvg);
}

export async function generateFontTtf(config: Omit<AppConfig, 'output'>, files: SymbolMetadata[]): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const filesReadStream = new StreamRead(config.input);
    const prepareStream = new TransformPrepareIcons();
    const svgFontStream = new TransformToTTFFont(config.name);

    let result: Buffer;
    const writeStream = new Writable({
      write(chunk: any, _encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
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

    filesReadStream.pipe(prepareStream).pipe(svgFontStream).pipe(writeStream);
  })
}