import { BufferByte } from '../entities/buffer-byte.ts';

export function unsignedLong(t: number): number {
  t &= 0xffffffff;
  if (t < 0) {
    t += 0x100000000;
  }
  return t;
}

export function computeChecksum(buffer: BufferByte): number {
  let sum = 0;
  const longs = Math.floor(buffer.length / 4);

  for (let i = 0; i < longs; ++i) {
    const t = buffer.getUint32(i * 4);
    sum = unsignedLong(sum + t);
  }

  const leftBytes = buffer.length - longs * 4;

  if (leftBytes > 0) {
    let leftRes = 0;

    for (let i = 0; i < 4; i++) {
      leftRes = (leftRes << 8) + ((i < leftBytes) ? buffer.getUint8(longs * 4 + i) : 0);
    }
    sum = unsignedLong(sum + leftRes);
  }
  return sum;
}
