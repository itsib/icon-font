import path from 'node:path';
import { StreamRead } from './src/streams/stream-read/stream-read';
import { TransformPrepareIcons } from './src/streams/transform-prepare-icons/transform-prepare-icons';
import { TransformToSvgFont } from './src/streams/transform-to-svg-font/transform-to-svg-font';
import { Writable } from 'node:stream';
import { SYMBOL_SIZE } from './src/utils/constants';
import { TransformToCss } from './src/streams/transform-to-css/transform-to-css';
import fs from 'node:fs';

async function test() {
  const input = path.join(process.cwd(), 'svg-icons');
  const output = path.join(process.cwd(), 'tmp');

  const filesReadStream = new StreamRead(input);
  const prepareStream = new TransformPrepareIcons();
  const fileTransformerStream = new TransformToCss('Icon Font', ['woff2', 'woff2', 'ttf', 'eot']);

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