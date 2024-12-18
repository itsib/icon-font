import { Buffer } from 'node:buffer';

Buffer.prototype.create = function(size: number, safe?: boolean): Buffer {
  const buffer = safe ? Buffer.alloc(size) : Buffer.allocUnsafe(size);



  return buffer;
}
