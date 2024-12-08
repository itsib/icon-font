import path from 'node:path';
import { StreamDirectoryReader } from './src/streams/stream-directory-reader';
import { StreamPrepareTransformer } from './src/streams/stream-prepare-transformer';
import { StreamSvgFontTransformer } from './src/streams/stream-svg-font-transformer';
import { Writable } from 'node:stream';
import { SYMBOL_SIZE } from './src/utils/constants';
import { StreamCssTransformer } from './src/streams/stream-css-transformer';
import fs from 'node:fs';

async function test() {
  const input = path.join(process.cwd(), 'svg-icons');
  const output = path.join(process.cwd(), 'tmp');

  const filesReadStream = new StreamDirectoryReader(input);
  const prepareStream = new StreamPrepareTransformer();
  const fileTransformerStream = new StreamCssTransformer('Icon Font', ['woff2', 'woff2', 'ttf', 'eot']);

  const writeStream = fs.createWriteStream(path.join(output, 'icon-font.css'))

  let result = '';
  // const writeStream = new Writable({
  //   write(chunk: any, _encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
  //     result += chunk.toString();
  //     callback();
  //   },
  //   final(callback: (error?: (Error | null)) => void) {
  //     console.log(result);
  //     callback();
  //   },
  //   destroy(error: Error | null, callback: (error?: (Error | null)) => void) {
  //     if (error) {
  //       console.log(error);
  //     }
  //     callback(error);
  //   },
  // });

  filesReadStream.pipe(prepareStream).pipe(fileTransformerStream).pipe(writeStream);
}

test();

// console.log(ucs2decode('&#xEA13;'))