import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';

export function createNameTable(font: Font): BufferByte {
  const { names, size } = font.getNames();
  const buffer = new BufferByte(size + 6);

  buffer.writeUint16(0); // formatSelector
  buffer.writeUint16(names.length); // nameRecordsCount
  const offsetPosition = buffer.tell();

  buffer.writeUint16(0); // offset, will be filled later
  let nameOffset = 0;

  for(let i = 0; i < names.length; i++) {
    const name = names[i];
    buffer.writeUint16(name.flags[0]); // platformID
    buffer.writeUint16(name.flags[1]); // platEncID
    buffer.writeUint16(name.flags[2]); // languageID, English (USA)
    buffer.writeUint16(name.id); // nameID
    buffer.writeUint16(name.data.length); // reclength
    buffer.writeUint16(nameOffset); // offset
    nameOffset += name.data.length;
  }

  const actualStringDataOffset = buffer.tell();

  //Array of bytes with actual string data
  for(let i = 0; i < names.length; i++) {
    buffer.writeBytes(names[i].data);
  }

  //write actual string data offset
  buffer.seek(offsetPosition);
  buffer.writeUint16(actualStringDataOffset); // offset

  return buffer;
}

