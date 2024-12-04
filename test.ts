import fs from 'node:fs';
import path from 'node:path';
import { SvgIconConfig, SvgIconTransformStream } from './src/utils/svg-icon-transform-stream';
import { START_UNICODE } from './src/utils/constants';


async function test() {
  const id = 'settings-outline';
  const tmpDir = path.join(process.cwd(), 'tmp');
  const inputFile = path.join(process.cwd(), `svg-icons/${id}.svg`);
  const outputFile = path.join(tmpDir, `${id}.svg`);

  const code = START_UNICODE;
  const iconInfo: SvgIconConfig = {
    id: id,
    name: id,
    code: code,
    unicode: `&#x${(code).toString(16).toUpperCase()};`,
    canvasSize: 512,
    shapeMaxSize: 480,
    path: inputFile
  }

  fs.mkdirSync(tmpDir, { recursive: true });

  const writeStream = fs.createWriteStream(outputFile);
  const readStream = fs.createReadStream(inputFile);

  const transformStream = new SvgIconTransformStream(iconInfo);

  transformStream.on('error', err => {
    console.error(err);
  });

  transformStream.destination(writeStream);

  readStream.pipe(transformStream);

}

test();