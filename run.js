const fs = require('fs');
const svg2ttf = require('./src/svg-to-ttf/index.js');

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

  process.stdout.write(`\x1b[2;37m${line}\x1b[0m\n`);
  for (let offset = 0; offset < data.length; offset++) {
    /** @type {number} */
    const byte = data[offset];

    // Render address column
    if (offset % 16 === 0) {
      const address = offset.toString(16).toUpperCase().padStart(addressLength, '0');
      process.stdout.write(`\x1b[0;30;107m ${address} \x1b[0m  `);
    }

    if (byte === 0) {
      process.stdout.write('\x1b[2;37m00\x1b[0m ');
    } else if (byte === 255) {
      process.stdout.write('\x1b[2;33mFF\x1b[0m ');
    } else {
      const byteHex = byte.toString(16).padStart(2, '0').toUpperCase();
      process.stdout.write(byteHex + ' ');
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

(async () => {
  const svfFont = fs.readFileSync('./tmp/icon-font.svg', 'utf8');

  const ttfFont = await svg2ttf(svfFont);

  renderBytesTable(ttfFont.buffer);

  fs.writeFileSync('./tmp/icon-font.ttf', ttfFont.buffer);
  // console.log();
})();