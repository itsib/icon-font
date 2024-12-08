/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __APP_NAME__: string;
declare const __APP_DESCRIPTION__: string;

declare module 'microbuffer' {
  export default class ByteBuffer {
    constructor(size: number | Uint8Array, start?: number, length?: number);
    buffer: Uint8Array;
    start: number;
    length: number;
    offset: number;

    tell(): number;
    seek(post: number): number;
    fill(value: number): number;

    getUint8(pos: number): number;
    getUint16(pos: number): number;
    getUint32(pos: number): number;

    setUint8(pos: number, value: number): void;
    setUint16(pos: number, value: number, littleEndian?: boolean): void;
    setUint32(pos: number, value: number, littleEndian?: boolean): void;

    writeInt8(value: number): void;
    writeInt16(value: number, littleEndian?: boolean): void;
    writeInt32(value: number, littleEndian?: boolean): void;

    writeUint8(value: number): void;
    writeUint16(value: number, littleEndian?: boolean): void;
    writeUint32(value: number, littleEndian?: boolean): void;
    writeUint64(value: number): void;

    writeBytes(byes: Uint8Array): this;

    toString(offset: number, length: number): string;

    toArray(): number[];
  }
}