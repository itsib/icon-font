import { tableIdentifier } from '../../../utils/string-to-bytes.ts';
import { BufferByte } from '../../../entities/buffer-byte.ts';

export function createGSUBTable(): BufferByte {
  /**
   * +4 Version
   * +6 (2 * 3) lists
   */
  const headerSize = 10;
  const scriptsSize = 38;
  const featuresSize = 14;
  const lookupsSize = 36;

  const totalSize = headerSize + scriptsSize + featuresSize + lookupsSize;
  const buffer = new BufferByte(totalSize);

  buffer.writeUint32(0x00010000); // version
  buffer.writeUint16(headerSize); // address scripts
  buffer.writeUint16(headerSize + scriptsSize); // address features
  buffer.writeUint16(headerSize + scriptsSize + featuresSize); // address lookups

  // SCRIPTS header (14 bytes)
  buffer.writeUint16(2); // script count
  buffer.writeUint32(tableIdentifier('DFLT')); // Script identifier
  buffer.writeUint16(14); // Offset to the ScriptRecord from start of the script list
  buffer.writeUint32(tableIdentifier('latn'));
  buffer.writeUint16(26);

  // Script DFLT (12 bytes)
  buffer.writeUint16(4);
  buffer.writeUint16(0);
  buffer.writeUint16(0);
  buffer.writeUint16(0);
  buffer.writeUint16(1);
  buffer.writeUint16(0);

  // Script latn (12 bytes)
  buffer.writeUint16(4);
  buffer.writeUint16(0);
  buffer.writeUint16(0);
  buffer.writeUint16(0);
  buffer.writeUint16(1);
  buffer.writeUint16(0);

  // FEATURES (14 bytes)
  buffer.writeUint16(1);
  buffer.writeUint32(tableIdentifier('liga'));
  buffer.writeUint16(8);
  buffer.writeUint16(0);
  buffer.writeUint16(1);
  buffer.writeUint16(0);

  // LOOKUPS header (4 byte)
  buffer.writeUint16(1);
  buffer.writeUint16(4);

  // LOOKUPS (32 bytes)
  buffer.writeUint16(4);
  buffer.writeUint16(0);
  buffer.writeUint16(1);
  buffer.writeUint16(8);
  buffer.writeUint16(1);
  buffer.writeUint16(6);
  buffer.writeUint16(0);
  buffer.writeUint16(1);
  buffer.writeUint16(0);

  return buffer;
}


