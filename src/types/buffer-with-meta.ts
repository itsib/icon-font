export interface BufferWithMeta<Meta> extends Buffer {
  metadata: Meta;
}