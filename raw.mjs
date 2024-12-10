import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';

/**
 *
 * @param {number[]} bytes
 * @returns {string}
 */
function renderBytes(bytes) {
  return bytes.reduce((acc, byte, index) => {
    if (byte <= 0x1F || (byte >= 0x7F && byte <= 0xA0) || byte === 0xFF || byte === 0xA8) {
      return acc + '.';
    }

    const char = String.fromCodePoint(byte);
    if (/^\s+$/.test(char)) {
      return acc + ' ';
    }
    return acc + char;
  }, '');
}

/**
 * Display byte in table
 * @param {Buffer<ArrayBufferLike>} data
 */
function renderBytesTable(data) {
  const addressLength = data.length.toString(16).length;
  const line = `─`.repeat(49 + addressLength + 4);

  const ascii = [];

  process.stdout.write(`\x1b[0;97;44m${' '.repeat(addressLength + 4)}`);
  for (let i = 0; i < 16; i++) {
    const coll = i.toString(16).toUpperCase().padStart(2, '0');
    if (i && i % 8 === 0) {
      process.stdout.write(`  `);
    }

    process.stdout.write(`${coll} `);
  }
  process.stdout.write(`\x1b[0m\n`)


  for (let offset = 0; offset < data.length; offset++) {
    /** @type {number} */
    const byte = data[offset];

    // Render address column
    if (offset % 16 === 0) {
      const address = offset.toString(16).toUpperCase().padStart(addressLength, '0');
      process.stdout.write(`\x1b[0;97;44m ${address} \x1b[0m  `);
    }

    if (byte === 0) {
      process.stdout.write('\x1b[2;37m00\x1b[0m ');
    } else if (byte === 255) {
      process.stdout.write('\x1b[0;33mFF\x1b[0m ');
    } else {
      const byteHex = byte.toString(16).padStart(2, '0').toUpperCase();
      process.stdout.write(byteHex + ' ');
    }
    ascii.push(byte);

    if (offset > 0 && (offset + 1) % 8 === 0) {
      process.stdout.write('  ');
    }

    if (offset > 0 && (offset + 1) % 16 === 0) {
      process.stdout.write(` \x1b[2;37m${renderBytes(ascii)}\x1b[0m\n`);
      ascii.length = 0;
    }
  }
  process.stdout.write(`\n\x1b[2;37m${line}\x1b[0m\n`);

  console.log('\x1b[0;97mTotal:\x1b[0m \x1b[0;94m%i\x1b[0m \x1b[0;93m0x%s\x1b[0m Bytes', data.length, data.length.toString(16).toUpperCase());
}

/**
 * Render file as bytes table
 */
function run() {
  let filePath = process.argv[2];
  filePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  const basename = path.basename(filePath);
  const dirname = path.dirname(filePath);

  const stream = fs.createReadStream(filePath);

  stream.on('end', () => {
    process.stdout.write('\n');
    console.log(`Done!`);
  });

  stream.on('open', () => {
    console.log(`\x1b[0;93mFile:\x1b[0m \x1b[0;37m${dirname}${path.sep}\x1b[0m\x1b[0;96m${basename}\x1b[0m\n`);
  });

  stream.on('error', (err) => {
    console.error(err);
  });

  stream.on('data', (data) => {
    renderBytesTable(data);
  });
}

run();