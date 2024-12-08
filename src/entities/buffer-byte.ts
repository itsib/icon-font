export class BufferByte {

  buffer: Uint8Array;

  start: number;

  length: number;

  offset: number;

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

  toArray() {
    return this.buffer.subarray(this.start, this.start + this.length);
  }
}