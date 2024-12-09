export class BufferByte {

  buffer: Uint8Array;

  start: number;

  length: number;

  offset: number;

  private _logPosition?: number;

  constructor(buffer: number | BufferByte, start?: number, length?: number) {
    if (buffer instanceof BufferByte) {
      this.buffer = buffer.buffer;
      this.start = (start || 0) + buffer.start;
    } else {
      this.buffer = new Uint8Array(buffer);
      this.start = start || 0;
    }
    this.length = length || (this.buffer.length - this.start)
    this.offset = 0;
  }

  getUint8(pos: number): number {
    return this.buffer[pos + this.start];
  }

  getUint16(pos: number): number {
    const first = this.buffer[pos + 1 + this.start];
    return first + (this.buffer[pos + this.start] << 8 >>> 0);
  }

  getUint32(pos: number): number {
    let val = this.buffer[pos + 1 + this.start] << 16;
    val |= this.buffer[pos + 2 + this.start] << 8;
    val |= this.buffer[pos + 3 + this.start];
    val += this.buffer[pos + this.start] << 24 >>> 0;
    return val;
  }

  setUint8(pos: number, value: number): void {
    this.buffer[pos + this.start] = value & 0xFF;
  }

  setUint16(pos: number, value: number): void {
    const offset = pos + this.start;
    this.buffer[offset] = (value >>> 8) & 0xFF;
    this.buffer[offset + 1] = value & 0xFF;
  }

  setUint32(pos: number, value: number): void {
    const offset = pos + this.start;
    this.buffer[offset] = (value >>> 24) & 0xFF;
    this.buffer[offset + 1] = (value >>> 16) & 0xFF;
    this.buffer[offset + 2] = (value >>> 8) & 0xFF;
    this.buffer[offset + 3] = value & 0xFF;
  }

  writeUint8(value: number): void {
    this.buffer[this.offset + this.start] = value & 0xFF;
    this.offset++;
  }

  writeInt8(value: number): void {
    this.setUint8(this.offset, (value < 0) ? 0xFF + value + 1 : value);
    this.offset++;
  }

  writeUint16(value: number): void {
    this.setUint16(this.offset, value);
    this.offset += 2;
  }

  writeInt16(value: number): void {
    this.setUint16(this.offset, (value < 0) ? 0xFFFF + value + 1 : value);
    this.offset += 2;
  }

  writeUint32(value: number): void {
    this.setUint32(this.offset, value);
    this.offset += 4;
  }

  writeInt32(value: number): void {
    this.setUint32(this.offset, (value < 0) ? 0xFFFFFFFF + value + 1 : value);
    this.offset += 4;
  }

  writeUint64(value: number): void {
    const hi = Math.floor(value / 4294967296);
    const lo = value - hi * 4294967296;
    this.writeUint32(hi);
    this.writeUint32(lo);
  }

  /**
   * Returns current position (offset)
   */
  tell(): number {
    return this.offset;
  }

  /**
   * Set current position (offset)
   * @param pos
   */
  seek(pos: number): void {
    this.offset = pos;
  }

  fill(value: number): void {
    let index = this.length - 1;
    while (index >= 0) {
      this.buffer[index + this.start] = value;
      index--;
    }
  }

  writeBytes(data: ArrayLike<number>): void {
    const offset = this.offset + this.start;
    this.buffer.set(data, offset);
    this.offset += data.length;
  }

  slice(offset = 0, length?: number): Uint8Array {
    length = length || (this.length - offset);
    const start = offset + this.start;
    const end = start + length;

    let index = 0
    const buffer = new Uint8Array(length);
    for (let i = start; i < end; i++) {
      buffer[index++] = this.buffer[i];
    }
    return buffer;
  }

  toString(offset = 0, length?: number): string {
    length = length || (this.length - offset);

    const start = offset + this.start;
    const end = start + length;

    let string = '';
    for (let i = start; i < end; i++) {
      string += String.fromCharCode(this.buffer[i]);
    }
    return string;
  }

  startLog() {
    if ((this.offset % 32) === 0) {
      this._logPosition = this.offset;
    } else {
      this._logPosition = Math.floor(this.offset / 32) * 32;
    }
  }

  endLog() {
    if (this._logPosition == null) {
      throw new Error('You need call from method before');
    }

    const length = Math.ceil((this.offset - this._logPosition) / 32) * 32;

    this.log(this._logPosition, length);
    this._logPosition = undefined;
  }

  log(offset?: number, length?: number) {
    const renderBytes = (bytes: number[]) => {
      return bytes.reduce((acc, byte) => {
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

    const buffer = offset == null ? this.buffer : this.slice(offset, length);
    const addressLength = buffer.length.toString(16).length;
    const line = `─`.repeat(49 + addressLength + 4);

    const ascii = [];

    process.stdout.write(`\x1b[2;37m${line}\x1b[0m\n`);
    for (let i = 0; i < buffer.length; i++) {
      /** @type {number} */
      const byte = buffer[i];

      // Render address column
      if (i % 16 === 0) {
        const address = (i + (offset || 0)).toString(16).toUpperCase().padStart(addressLength, '0');
        process.stdout.write(`\x1b[0;30;107m ${address} \x1b[0m  `);
      }

      if (byte === 0) {
        process.stdout.write('\x1b[2;37m00\x1b[0m ');
      } else if (byte === 255) {
        process.stdout.write('\x1b[2;33mFF\x1b[0m ');
      } else {
        const byteHex = byte.toString(16).padStart(2, '0').toUpperCase();
        process.stdout.write(byteHex + ' ');
      }
      ascii.push(byte);

      if (i > 0 && (i + 1) % 8 === 0) {
        process.stdout.write('  ');
      }

      if (i > 0 && (i + 1) % 16 === 0) {
        process.stdout.write(` \x1b[2;37m${renderBytes(ascii)}\x1b[0m\n`);
        ascii.length = 0;
      }
    }
    process.stdout.write(`\n\x1b[2;37m${line}\x1b[0m\n`);

    console.log('\x1b[0;97mTotal:\x1b[0m \x1b[0;94m%i\x1b[0m \x1b[0;93m0x%s\x1b[0m Bytes', buffer.length, buffer.length.toString(16).toUpperCase());
  }

  toArray() {
    return this.buffer.subarray(this.start, this.start + this.length);
  }
}