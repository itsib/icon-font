import { BufferByte } from '../../../entities/buffer-byte.ts';
import { Font } from '../../../entities/font.ts';
import { toUCS2Bytes, toUTF8Bytes } from '../../../utils/string-to-bytes.ts';

const TTF_NAMES = {
  COPYRIGHT: 0,
  FONT_FAMILY: 1,
  ID: 3,
  DESCRIPTION: 10,
  URL_VENDOR: 11
};

interface Name {
  data: Uint8Array;
  id: number;
  platformID: number;
  encodingID: number;
  languageID: number;
}

function tableSize(names: Name[]): number {
  let result = 6; // table header

  names.forEach(name => {
    result += 12 + name.data.length; //name header and data
  });
  return result;
}

function getStrings(name: string, id: number): Name[] {
  const result: Name[] = [];

  result.push({ data: toUTF8Bytes(name), id: id, platformID: 1, encodingID: 0, languageID: 0 }); //mac standard
  result.push({ data: toUCS2Bytes(name), id: id, platformID: 3, encodingID: 1, languageID: 0x409 }); //windows standard
  return result;
}

/**
 * Collect font names
 * @param font
 */
function getNames(font: Font): Name[] {
  const result: Name[] = [];

  if (font.copyright) {
    result.push(...getStrings(font.copyright, TTF_NAMES.COPYRIGHT));
  }
  if (font.familyName) {
    result.push(...getStrings(font.familyName, TTF_NAMES.FONT_FAMILY));
  }
  if (font.id) {
    result.push(...getStrings(font.id, TTF_NAMES.ID));
  }
  result.push(...getStrings(font.description, TTF_NAMES.DESCRIPTION));
  result.push(...getStrings(font.url, TTF_NAMES.URL_VENDOR));

  font.sfntNames.forEach(sfntName => {
    result.push(...getStrings(sfntName.value, sfntName.id));
  });

  result.sort((a, b) => {
    const orderFields: (keyof Name)[] = ['platformID', 'encodingID', 'languageID', 'id'];

    for (const field of orderFields) {
      if (a[field] !== b[field]) {
        return a[field] < b[field] ? -1 : 1;
      }
    }
    return 0;
  });

  return result;
}

export function createNameTable(font: Font): BufferByte {
  const names = getNames(font);

  const buf = new BufferByte(tableSize(names));

  buf.writeUint16(0); // formatSelector
  buf.writeUint16(names.length); // nameRecordsCount
  const offsetPosition = buf.tell();

  buf.writeUint16(0); // offset, will be filled later
  let nameOffset = 0;

  names.forEach(name => {
    buf.writeUint16(name.platformID); // platformID
    buf.writeUint16(name.encodingID); // platEncID
    buf.writeUint16(name.languageID); // languageID, English (USA)
    buf.writeUint16(name.id); // nameID
    buf.writeUint16(name.data.length); // reclength
    buf.writeUint16(nameOffset); // offset
    nameOffset += name.data.length;
  });
  const actualStringDataOffset = buf.tell();

  //Array of bytes with actual string data
  names.forEach(name => {
    buf.writeBytes(name.data);
  });

  //write actual string data offset
  buf.seek(offsetPosition);
  buf.writeUint16(actualStringDataOffset); // offset

  return buf;
}

