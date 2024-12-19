import { BufferWithMeta } from '../types';

export function populateMetadata<Meta>(buffer: Buffer, metadata: Meta): BufferWithMeta<Meta> {
  Object.defineProperty(buffer, 'metadata', {
    value: Object.freeze({ ...metadata }),
    enumerable: true,
    writable: false,
    configurable: false,
  });
  return buffer as BufferWithMeta<Meta>;
}